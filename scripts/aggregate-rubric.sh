#!/usr/bin/env bash
# aggregate-rubric.sh — Combine 3 model JSON outputs into a per-team rubric.md
#
# Usage:
#   aggregate-rubric.sh \
#     --team <id> \
#     --claude <claude.json> \
#     --gemini <gemini.json> \
#     --gpt <gpt.json> \
#     --out <rubric.md>
#
# Each JSON file shape:
#   { "scores": {readme,code,ai_usage,completeness,differentiation},
#     "comments": {readme,code,ai_usage,completeness,differentiation},
#     "overall": "...",
#     "human_review_flags": ["..."] }
#
# AI 평균 = (Claude + Gemini + GPT) / 3 per item.
# AI 종합 = Σ (AI 평균 × 항목 가중치).
# 항목 가중치 default: README 20 · code 25 · ai 25 · complete 20 · diff 10 (= 100%).

set -euo pipefail

TEAM_ID=""
CLAUDE_JSON=""
GEMINI_JSON=""
GPT_JSON=""
OUT_FILE=""

# 항목 가중치 (기본값, --w-* 로 override 가능, 합 100 검증)
W_README=20
W_CODE=25
W_AI=25
W_COMPLETE=20
W_DIFF=10

while [[ $# -gt 0 ]]; do
  case "$1" in
    --team)        TEAM_ID="$2"; shift 2 ;;
    --claude)      CLAUDE_JSON="$2"; shift 2 ;;
    --gemini)      GEMINI_JSON="$2"; shift 2 ;;
    --gpt)         GPT_JSON="$2"; shift 2 ;;
    --out)         OUT_FILE="$2"; shift 2 ;;
    --w-readme)    W_README="$2"; shift 2 ;;
    --w-code)      W_CODE="$2"; shift 2 ;;
    --w-ai)        W_AI="$2"; shift 2 ;;
    --w-complete)  W_COMPLETE="$2"; shift 2 ;;
    --w-diff)      W_DIFF="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -z "$TEAM_ID" || -z "$OUT_FILE" ]] && { echo "ERROR: --team, --out required" >&2; exit 1; }

# 항목 가중치 합 검증
weights_sum=$(awk -v a="$W_README" -v b="$W_CODE" -v c="$W_AI" -v d="$W_COMPLETE" -v e="$W_DIFF" \
  'BEGIN { print a + b + c + d + e }')
if [[ "$weights_sum" != "100" ]]; then
  echo "WARNING: 항목 가중치 합 = $weights_sum (기대값 100)." >&2
  echo "  현재: README=$W_README · 코드=$W_CODE · AI=$W_AI · 완성=$W_COMPLETE · 차별=$W_DIFF" >&2
  echo "  --w-readme / --w-code / --w-ai / --w-complete / --w-diff 로 조정." >&2
fi

# Helper: extract scalar score from JSON, default 0 if missing/error
get_score() {
  local file="$1" key="$2"
  if [[ ! -f "$file" ]] || ! jq -e ".scores.$key" "$file" >/dev/null 2>&1; then
    echo "0"
    return
  fi
  jq -r ".scores.$key" "$file" 2>/dev/null || echo "0"
}

get_comment() {
  local file="$1" key="$2"
  if [[ ! -f "$file" ]] || ! jq -e ".comments.$key" "$file" >/dev/null 2>&1; then
    echo "(no response)"
    return
  fi
  jq -r ".comments.$key // \"(no response)\"" "$file" 2>/dev/null
}

get_overall() {
  local file="$1"
  if [[ ! -f "$file" ]] || ! jq -e ".overall" "$file" >/dev/null 2>&1; then
    echo "(no response)"
    return
  fi
  jq -r ".overall // \"(no response)\"" "$file" 2>/dev/null
}

get_flags() {
  local file="$1"
  if [[ ! -f "$file" ]] || ! jq -e ".human_review_flags" "$file" >/dev/null 2>&1; then
    return
  fi
  jq -r '.human_review_flags[]? | "- " + .' "$file" 2>/dev/null
}

# Per-item AI scores
items=(readme code ai_usage completeness differentiation)
labels=("README 충실도" "코드 품질" "AI 활용도" "완성도" "차별성")
weights=($W_README $W_CODE $W_AI $W_COMPLETE $W_DIFF)

# Build the rubric markdown
{
  echo "# $TEAM_ID 채점 결과 (AI 심사 — 3 모델 독립 채점)"
  echo
  echo "> 자동 채점: $(date '+%Y-%m-%d %H:%M') · 채점 모델: 🟣 Claude · 🟦 Gemini · 🟢 GPT"
  echo "> ⚠️ AI 심사 결과는 평가의 한 source — 동료 평가 + 심사위원 평가와 가중 합산하여 최종 점수."
  echo
  echo "## 항목별 — 3 모델 점수 + AI 평균"
  echo

  total_ai=0
  table_rows=""

  for i in "${!items[@]}"; do
    key="${items[$i]}"
    label="${labels[$i]}"
    weight="${weights[$i]}"

    c=$(get_score "$CLAUDE_JSON" "$key")
    g=$(get_score "$GEMINI_JSON" "$key")
    p=$(get_score "$GPT_JSON" "$key")

    # AI 평균 = (c + g + p) / 3
    avg=$(awk -v c="$c" -v g="$g" -v p="$p" 'BEGIN { printf "%.1f", (c + g + p) / 3 }')

    # 가중 합산에 누적
    total_ai=$(awk -v t="$total_ai" -v a="$avg" -v w="$weight" 'BEGIN { printf "%.2f", t + a * w / 10 }')
    # 위 계산: 점수 0-10 × 가중치(%) / 10 = 항목별 0-가중치(%) 점수

    cc=$(get_comment "$CLAUDE_JSON" "$key")
    gc=$(get_comment "$GEMINI_JSON" "$key")
    pc=$(get_comment "$GPT_JSON" "$key")

    echo "### $label — AI 평균 **$avg** / 10 (가중치 $weight%)"
    echo
    echo "| 모델 | 점수 | 코멘트 |"
    echo "|---|---|---|"
    echo "| 🟣 Claude | $c | $cc |"
    echo "| 🟦 Gemini | $g | $gc |"
    echo "| 🟢 GPT | $p | $pc |"
    echo
  done

  echo "## AI 종합 점수: **$total_ai / 100**"
  echo
  echo "= Σ (항목별 AI 평균 × 가중치)"
  echo

  echo "## AI 의 종합 의견"
  echo
  echo "**🟣 Claude**: $(get_overall "$CLAUDE_JSON")"
  echo
  echo "**🟦 Gemini**: $(get_overall "$GEMINI_JSON")"
  echo
  echo "**🟢 GPT**: $(get_overall "$GPT_JSON")"
  echo

  echo "## 사람 심사위원 검토 권장 항목"
  echo
  flags="$(get_flags "$CLAUDE_JSON")$(get_flags "$GEMINI_JSON")$(get_flags "$GPT_JSON")"
  if [[ -z "${flags// }" ]]; then
    echo "(AI 가 특별히 플래그한 항목 없음)"
  else
    get_flags "$CLAUDE_JSON" | sed 's/^- /- 🟣 /'
    get_flags "$GEMINI_JSON" | sed 's/^- /- 🟦 /'
    get_flags "$GPT_JSON"    | sed 's/^- /- 🟢 /'
  fi
  echo
  echo "---"
  echo
  echo "## 최종 점수 계산 (operator 가 채울 부분)"
  echo
  echo "최종 점수 = AI 종합 × W_AI + 동료 평가 × W_PEER + 심사위원 × W_JUDGE"
  echo
  echo "| Source | 점수 (0-100) | 가중치 |"
  echo "|---|---|---|"
  echo "| 🤖 AI 심사 | **$total_ai** | (예: 40%) |"
  echo "| 👥 동료 평가 | _대기_ | (예: 30%) |"
  echo "| 🧑‍⚖️ 심사위원 평가 | _대기_ | (예: 30%) |"
  echo "| **최종** | _대기_ | (합 100%) |"
} > "$OUT_FILE"

echo "✓ Rubric: $OUT_FILE (AI 종합: $total_ai)"
