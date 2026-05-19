#!/usr/bin/env bash
# build-leaderboard.sh — Aggregate per-team rubric.md + optional peer/judge scores into leaderboard.md
#
# Usage:
#   build-leaderboard.sh --rubric-dir <dir> --out <leaderboard.md> \
#                        [--peer <peer-scores.json>] \
#                        [--judge <judge-scores.json>] \
#                        [--w-ai 40] [--w-peer 30] [--w-judge 30]
#
# Compatible with bash 3.2 (macOS default) — no associative arrays.

set -euo pipefail

RUBRIC_DIR=""
OUT_FILE=""
PEER_FILE=""
JUDGE_FILE=""
W_AI=40
W_PEER=30
W_JUDGE=30

while [[ $# -gt 0 ]]; do
  case "$1" in
    --rubric-dir) RUBRIC_DIR="$2"; shift 2 ;;
    --out)        OUT_FILE="$2"; shift 2 ;;
    --peer)       PEER_FILE="$2"; shift 2 ;;
    --judge)      JUDGE_FILE="$2"; shift 2 ;;
    --w-ai)       W_AI="$2"; shift 2 ;;
    --w-peer)     W_PEER="$2"; shift 2 ;;
    --w-judge)    W_JUDGE="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -z "$RUBRIC_DIR" || -z "$OUT_FILE" ]] && { echo "ERROR: --rubric-dir, --out required" >&2; exit 1; }
[[ ! -d "$RUBRIC_DIR" ]] && { echo "ERROR: rubric dir not found: $RUBRIC_DIR" >&2; exit 1; }

# Verify weights sum to 100
sum=$(awk -v a="$W_AI" -v p="$W_PEER" -v j="$W_JUDGE" 'BEGIN { print a + p + j }')
if [[ "$sum" != "100" ]]; then
  echo "WARNING: weights sum = $sum (expected 100). Adjust --w-ai/--w-peer/--w-judge." >&2
fi

# Helpers
get_peer_score() {
  local team="$1"
  [[ -z "$PEER_FILE" ]] && { echo "0"; return; }
  [[ ! -f "$PEER_FILE" ]] && { echo "0"; return; }
  jq -r --arg t "$team" '.[$t] // 0' "$PEER_FILE" 2>/dev/null || echo "0"
}

get_judge_score() {
  local team="$1"
  [[ -z "$JUDGE_FILE" ]] && { echo "0"; return; }
  [[ ! -f "$JUDGE_FILE" ]] && { echo "0"; return; }
  jq -r --arg t "$team" '.[$t] // 0' "$JUDGE_FILE" 2>/dev/null || echo "0"
}

# Build TSV of (team, ai, peer, judge, final), pre-sorted by final desc.
TSV="$(mktemp)"
trap 'rm -f "$TSV"' EXIT

found=0
for rubric in "$RUBRIC_DIR"/*.rubric.md; do
  [[ -f "$rubric" ]] || continue
  found=1
  team="$(basename "$rubric" .rubric.md)"
  ai_score="$(grep -oE 'AI 종합 점수: \*\*[0-9.]+' "$rubric" | grep -oE '[0-9.]+' | head -1)"
  ai_score="${ai_score:-0}"
  peer="$(get_peer_score "$team")"
  judge="$(get_judge_score "$team")"
  final=$(awk -v a="$ai_score" -v p="$peer" -v j="$judge" -v wa="$W_AI" -v wp="$W_PEER" -v wj="$W_JUDGE" \
    'BEGIN { printf "%.2f", (a * wa + p * wp + j * wj) / 100 }')
  printf "%s\t%s\t%s\t%s\t%s\n" "$team" "$ai_score" "$peer" "$judge" "$final" >> "$TSV"
done

if [[ $found -eq 0 ]]; then
  echo "ERROR: no *.rubric.md files in $RUBRIC_DIR" >&2
  exit 1
fi

# Sort by final score desc
SORTED="$(mktemp)"
trap 'rm -f "$TSV" "$SORTED"' EXIT
sort -t $'\t' -k5,5 -rn "$TSV" > "$SORTED"

# Generate leaderboard
{
  echo "# 리더보드"
  echo
  echo "> 자동 생성: $(date '+%Y-%m-%d %H:%M')"
  echo "> 가중치: 🤖 AI $W_AI% · 👥 동료 $W_PEER% · 🧑‍⚖️ 심사위원 $W_JUDGE% (합 ${sum}%)"
  echo "> ⚠️ AI 채점 1차 결과. 최종 시상은 사람 심사위원이 검토 후 확정."
  echo
  echo "## 종합 순위"
  echo
  echo "| 순위 | 팀 | 🤖 AI ($W_AI%) | 👥 동료 ($W_PEER%) | 🧑‍⚖️ 심사 ($W_JUDGE%) | **최종** |"
  echo "|---|---|---|---|---|---|"

  rank=1
  while IFS=$'\t' read -r team ai peer judge final; do
    echo "| $rank | $team | $ai | $peer | $judge | **$final** |"
    rank=$((rank+1))
  done < "$SORTED"

  echo
  echo "## 참고"
  echo
  echo "- 각 팀별 상세 채점은 \`<team>.rubric.md\` 참고"
  echo "- 동료 평가 / 심사위원 점수가 0인 팀은 해당 source 가 아직 수집되지 않은 상태"
} > "$OUT_FILE"

echo "✓ Leaderboard: $OUT_FILE"

# Also emit machine-readable leaderboard.json next to leaderboard.md (dashboard reads this).
JSON_OUT="${OUT_FILE%.md}.json"
{
  printf '{\n'
  printf '  "generated_at": "%s",\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  printf '  "weights": {"ai": %s, "peer": %s, "judge": %s},\n' "$W_AI" "$W_PEER" "$W_JUDGE"
  printf '  "has_peer": %s,\n' "$([[ -n $PEER_FILE && -f $PEER_FILE ]] && echo true || echo false)"
  printf '  "has_judge": %s,\n' "$([[ -n $JUDGE_FILE && -f $JUDGE_FILE ]] && echo true || echo false)"
  printf '  "teams": [\n'
  first=true
  rank=1
  while IFS=$'\t' read -r team ai peer judge final; do
    [[ $first == true ]] && first=false || printf ',\n'
    printf '    {"rank": %d, "team": "%s", "ai": %s, "peer": %s, "judge": %s, "final": %s}' \
      "$rank" "$team" "$ai" "$peer" "$judge" "$final"
    rank=$((rank+1))
  done < "$SORTED"
  printf '\n  ]\n}\n'
} > "$JSON_OUT"
echo "✓ JSON:        $JSON_OUT"

echo
echo "Top 3:"
head -3 "$SORTED" | while IFS=$'\t' read -r team ai peer judge final; do
  echo "  $team — final $final (AI $ai · peer $peer · judge $judge)"
done
