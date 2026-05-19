#!/usr/bin/env bash
# fetch-video.sh — Analyze a YouTube demo video via Gemini Video (File API URL).
#
# Why Gemini only: It's the only model that accepts a YouTube URL directly via
# fileData.fileUri (no download needed). The resulting visual transcript is then
# included as evidence text — all 3 judge models read the same text downstream.
#
# Usage:
#   fetch-video.sh --url https://youtu.be/XXXX --out /tmp/video-evidence.json
#
# Env required: GEMINI_API_KEY
# Optional: JUDGE_MODEL_GEMINI (default: gemini-3-pro-preview)
#
# Prompt assumes hackathon demo reality (per operator note 2026-05-17):
#   대부분 화면 시연 위주, 음성·자막은 거의 없음. 1분 30초 이내 핵심 시연.
#   → 보이는 UI / 기능 / 동작 순서를 시각 묘사 중심으로 정리.
#
# Output (JSON):
#   {
#     "ok": true,
#     "url": "...",
#     "visual_transcript": "...",
#     "key_features": ["..."],
#     "ui_elements": ["..."],
#     "notes": "..."
#   }

set -euo pipefail

URL=""
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url) URL="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    -h|--help) sed -n '2,25p' "$0" | sed 's|^#||'; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -z "$URL" || -z "$OUT" ]] && {
  echo "Usage: fetch-video.sh --url <youtube-url> --out <out.json>" >&2
  exit 1
}

# ─── Guard: YouTube URL allowlist ───
if ! [[ "$URL" =~ ^https://(www\.)?youtube\.com/watch\?v=[A-Za-z0-9_-]+ ]] \
   && ! [[ "$URL" =~ ^https://youtu\.be/[A-Za-z0-9_-]+ ]]; then
  jq -n --arg u "$URL" '{ok:false, url:$u, error:"URL not allowed — only youtube.com/watch?v=... or youtu.be/..."}' > "$OUT"
  exit 2
fi

if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  jq -n --arg u "$URL" '{ok:false, url:$u, error:"GEMINI_API_KEY not set"}' > "$OUT"
  exit 3
fi

MODEL="${JUDGE_MODEL_GEMINI:-gemini-3-pro-preview}"

PROMPT='첨부된 YouTube 영상은 AI 해커톤 데모. 대부분 화면 시연 위주, 음성·자막 거의 없음. 첫 1분 30초만 보고 분석.

JSON 만 출력 (markdown 코드펜스 X). 각 필드 간결하게:

{
  "visual_transcript": "시간 순서대로 화면에 보이는 것 6-10 문장. UI 요소·동작·결과 화면 중심.",
  "key_features": ["기능 1", "기능 2", "기능 3"],
  "ui_elements": ["UI 요소 1", "요소 2"],
  "notes": "음성 유무, 영상 품질 메모"
}'

# Gemini File API — fileData.fileUri accepts YouTube URL directly
PAYLOAD="$(jq -n --arg p "$PROMPT" --arg u "$URL" '{
  contents: [{
    parts: [
      {text: $p},
      {fileData: {fileUri: $u, mimeType: "video/*"}}
    ]
  }],
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 8192,
    responseMimeType: "application/json"
  }
}')"

RAW="$(curl -sS \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent" \
  -d "$PAYLOAD" \
  | jq -r '.candidates[0].content.parts[0].text // empty')"

if [[ -z "$RAW" ]]; then
  jq -n --arg u "$URL" '{ok:false, url:$u, error:"empty Gemini response"}' > "$OUT"
  exit 4
fi

# Validate JSON. Gemini wraps JSON-mode output in an array — unwrap if needed.
if echo "$RAW" | jq -e . >/dev/null 2>&1; then
  echo "$RAW" | jq --arg u "$URL" '
    (if type == "array" then .[0] else . end) as $obj
    | {ok:true, url:$u} + $obj
  ' > "$OUT"
  echo "✓ fetch-video: $URL → $OUT"
else
  jq -n --arg u "$URL" --arg r "$RAW" '{ok:false, url:$u, error:"non-JSON output", raw:$r}' > "$OUT"
  exit 5
fi
