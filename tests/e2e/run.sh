#!/usr/bin/env bash
# run.sh — E2E self-test: 3 builders → 3 judges → leaderboard.
#
# Env required:  ANTHROPIC_API_KEY · GEMINI_API_KEY · OPENAI_API_KEY
# Output:        data/submissions/team-XX.md  ·  data/output/team-XX.rubric.md  ·  data/output/leaderboard.md
# Dashboard:     http://localhost:3000/submissions  ·  /leaderboard

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

# ─── Auto-load env (so user doesn't need `set -a; source ...`) ───
# Priority: dashboard/.env.local (skill standard) > .env.local (user env)
ENV_FILE=""
[[ -f "$ROOT/dashboard/.env.local" ]] && ENV_FILE="$ROOT/dashboard/.env.local"
[[ -z "$ENV_FILE" && -f "$ROOT/.env.local" ]] && ENV_FILE="$ROOT/.env.local"
if [[ -n "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# ─── Env check ───
for var in ANTHROPIC_API_KEY GEMINI_API_KEY OPENAI_API_KEY; do
  if [[ -z "${!var:-}" ]]; then
    echo "✗ $var not set — create dashboard/.env.local with the 3 keys" >&2
    echo "   (run.sh auto-loads it; no manual source needed)" >&2
    exit 1
  fi
done

echo "═══════════════════════════════════════════════════"
echo "  AI Hackathon — E2E Self Test (3 teams, 3 judges)"
echo "═══════════════════════════════════════════════════"

# ─── Phase 1: builders (parallel) ───
echo
echo "▶ Phase 1 — Builders (parallel)"
mkdir -p data/submissions
tests/e2e/build-team.sh --team team-01 --model anthropic --prompt tests/e2e/prompts/team-01.md --out data/submissions/team-01.md &
PID_01=$!
tests/e2e/build-team.sh --team team-02 --model gemini    --prompt tests/e2e/prompts/team-02.md --out data/submissions/team-02.md &
PID_02=$!
tests/e2e/build-team.sh --team team-03 --model openai    --prompt tests/e2e/prompts/team-03.md --out data/submissions/team-03.md &
PID_03=$!

R01=0; wait $PID_01 || R01=$?
R02=0; wait $PID_02 || R02=$?
R03=0; wait $PID_03 || R03=$?

if [[ $R01 -ne 0 || $R02 -ne 0 || $R03 -ne 0 ]]; then
  echo "✗ Builder phase failed (team-01=$R01, team-02=$R02, team-03=$R03)" >&2
  exit 2
fi

# ─── Phase 2: judges (each team uses 3 judge models internally) ───
echo
echo "▶ Phase 2 — Judges (3 models per team)"
mkdir -p data/output
for team in team-01 team-02 team-03; do
  scripts/judge-submission.sh --submission "data/submissions/${team}.md" --out data/output 2>&1 | sed 's/^/  /'
done

# ─── Phase 3: leaderboard (dummy peer + judge scores) ───
echo
echo "▶ Phase 3 — Leaderboard (with dummy peer/judge scores)"
echo '{"team-01":78,"team-02":55,"team-03":88}' > data/peer-scores.json
echo '{"team-01":82,"team-02":60,"team-03":90}' > data/judge-scores.json
scripts/build-leaderboard.sh \
  --rubric-dir data/output \
  --out data/output/leaderboard.md \
  --peer data/peer-scores.json \
  --judge data/judge-scores.json | sed 's/^/  /'

echo
echo "═══════════════════════════════════════════════════"
echo "  ✓ E2E test passed"
echo "═══════════════════════════════════════════════════"
echo "  Submissions: data/submissions/team-{01,02,03}.md"
echo "  Rubrics:     data/output/team-{01,02,03}.rubric.md"
echo "  Leaderboard: data/output/leaderboard.md"
echo "  Dashboard:   http://localhost:3000/submissions"
echo "               http://localhost:3000/leaderboard"
