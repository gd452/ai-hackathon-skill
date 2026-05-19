#!/usr/bin/env bash
# build-team.sh — One virtual hackathon team built by one LLM.
#
# Usage:
#   build-team.sh --team <id> --model anthropic|gemini|openai \
#                 --prompt <prompt-file> --out <submission-md>
#
# Env (one of, depending on --model):
#   ANTHROPIC_API_KEY · GEMINI_API_KEY · OPENAI_API_KEY
#
# Optional model overrides:
#   BUILD_MODEL_ANTHROPIC (default: claude-sonnet-4-6)
#   BUILD_MODEL_GEMINI    (default: gemini-3-pro-preview)
#   BUILD_MODEL_OPENAI    (default: gpt-5.5)

set -euo pipefail

TEAM=""
MODEL=""
PROMPT_FILE=""
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --team)    TEAM="$2"; shift 2 ;;
    --model)   MODEL="$2"; shift 2 ;;
    --prompt)  PROMPT_FILE="$2"; shift 2 ;;
    --out)     OUT="$2"; shift 2 ;;
    -h|--help) sed -n '2,15p' "$0" | sed 's|^#||'; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -z "$TEAM" || -z "$MODEL" || -z "$PROMPT_FILE" || -z "$OUT" ]] && {
  echo "Usage: build-team.sh --team <id> --model anthropic|gemini|openai --prompt <file> --out <file>" >&2
  exit 1
}
[[ ! -f "$PROMPT_FILE" ]] && { echo "ERROR: prompt file not found: $PROMPT_FILE" >&2; exit 1; }

# ─── Auto-load env (skill-standard dashboard/.env.local first) ───
SCRIPT_DIR_BT="$(cd "$(dirname "$0")" && pwd)"
ROOT_BT="$(cd "$SCRIPT_DIR_BT/../.." && pwd)"
ENV_FILE_BT=""
[[ -f "$ROOT_BT/dashboard/.env.local" ]] && ENV_FILE_BT="$ROOT_BT/dashboard/.env.local"
[[ -z "$ENV_FILE_BT" && -f "$ROOT_BT/.env.local" ]] && ENV_FILE_BT="$ROOT_BT/.env.local"
if [[ -n "$ENV_FILE_BT" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE_BT"
  set +a
fi

mkdir -p "$(dirname "$OUT")"
prompt="$(cat "$PROMPT_FILE")"

MODEL_A="${BUILD_MODEL_ANTHROPIC:-claude-sonnet-4-6}"
MODEL_G="${BUILD_MODEL_GEMINI:-gemini-3-pro-preview}"
MODEL_O="${BUILD_MODEL_OPENAI:-gpt-5.5}"

case "$MODEL" in
  anthropic)
    [[ -z "${ANTHROPIC_API_KEY:-}" ]] && { echo "ANTHROPIC_API_KEY not set" >&2; exit 1; }
    payload="$(jq -n --arg p "$prompt" --arg m "$MODEL_A" '{
      model: $m,
      max_tokens: 8192,
      messages: [{role:"user", content:$p}]
    }')"
    curl -sS https://api.anthropic.com/v1/messages \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -H "content-type: application/json" \
      -d "$payload" \
      | jq -r '[.content[]? | select(.type=="text") | .text] | join("\n")' \
      > "$OUT"
    ;;
  gemini)
    [[ -z "${GEMINI_API_KEY:-}" ]] && { echo "GEMINI_API_KEY not set" >&2; exit 1; }
    payload="$(jq -n --arg p "$prompt" '{
      contents: [{parts: [{text: $p}]}],
      generationConfig: {temperature: 0.3, maxOutputTokens: 8192}
    }')"
    curl -sS \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H "Content-Type: application/json" \
      "https://generativelanguage.googleapis.com/v1beta/models/${MODEL_G}:generateContent" \
      -d "$payload" \
      | jq -r '.candidates[0].content.parts[0].text // empty' \
      > "$OUT"
    ;;
  openai)
    [[ -z "${OPENAI_API_KEY:-}" ]] && { echo "OPENAI_API_KEY not set" >&2; exit 1; }
    payload="$(jq -n --arg p "$prompt" --arg m "$MODEL_O" '{
      model: $m,
      messages: [{role:"user", content:$p}],
      max_completion_tokens: 8192
    }')"
    curl -sS https://api.openai.com/v1/chat/completions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$payload" \
      | jq -r '.choices[0].message.content // empty' \
      > "$OUT"
    ;;
  *)
    echo "Unknown model: $MODEL (use anthropic|gemini|openai)" >&2
    exit 1
    ;;
esac

[[ -s "$OUT" ]] || { echo "FAIL: empty output for $TEAM ($MODEL)" >&2; exit 1; }

# Strip outer ```markdown ... ``` wrapper if model added one
if head -1 "$OUT" | grep -qE '^```'; then
  tmp="$(mktemp)"
  sed '1{/^```/d;};${/^```$/d;}' "$OUT" > "$tmp" && mv "$tmp" "$OUT"
fi

bytes=$(wc -c < "$OUT" | tr -d ' ')
echo "✓ $TEAM ($MODEL) → $OUT ($bytes bytes)"
