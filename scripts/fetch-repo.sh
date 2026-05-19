#!/usr/bin/env bash
# fetch-repo.sh — Public GitHub repo evidence collector (codex 검증 보안 가드 통합).
#
# Usage:
#   fetch-repo.sh --url https://github.com/owner/repo --out /tmp/evidence.json
#
# Output (JSON):
#   {
#     "ok": true,
#     "url": "...",
#     "commit_sha": "...",
#     "extraction_summary": {...},
#     "evidence": {"readme": "...", "tree": "...", "deps": {...}, "entries": {...}}
#   }
#
# Security guards (per codex 2026-05-17 review):
#   1. github.com HTTPS only (regex allowlist)
#   2. Reject git@, ssh://, file://, http://, embedded credentials
#   3. sandbox tmp path with /hh- prefix (auto-cleanup)
#   4. clone --depth 1 --no-recurse-submodules (no git hooks)
#   5. timeout 30s for clone
#   6. size cap 50MB (post-clone du check)
#   7. per-file cap 256KB
#   8. total files cap 300
#   9. binary files skipped (heuristic: NUL byte in first 8KB)
#   10. symlink follow disabled
#   11. record commit SHA for reproducibility

set -euo pipefail

URL=""
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url) URL="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0" | sed 's|^#||'; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -z "$URL" || -z "$OUT" ]] && {
  echo "Usage: fetch-repo.sh --url <github-url> --out <out.json>" >&2
  exit 1
}

# ─── Guard 1+2: URL allowlist ───
if ! [[ "$URL" =~ ^https://github\.com/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+(\.git)?/?$ ]]; then
  jq -n --arg u "$URL" '{ok:false, url:$u, error:"URL not allowed — only https://github.com/<owner>/<repo>"}' > "$OUT"
  exit 2
fi

# Strip trailing slash and .git for normalization
URL="${URL%/}"
URL="${URL%.git}"

# ─── Guard 3: sandbox path ───
HASH="$(echo "$URL" | shasum -a 256 | cut -c1-12)"
SANDBOX="/tmp/hh-${HASH}-$$"
mkdir -p "$SANDBOX"
trap 'rm -rf "$SANDBOX"' EXIT

# ─── Guard 4+5: clone with timeout, depth 1, no submodules ───
clone_log="$SANDBOX/.clone.log"
clone_ok=true
if ! timeout 30 git clone --depth 1 --quiet --no-recurse-submodules "$URL.git" "$SANDBOX/repo" > "$clone_log" 2>&1; then
  jq -n --arg u "$URL" --arg log "$(cat "$clone_log" | tail -c 500)" \
    '{ok:false, url:$u, error:"clone failed or timeout", clone_log:$log}' > "$OUT"
  exit 3
fi

REPO="$SANDBOX/repo"
cd "$REPO"

# ─── Guard 6: size cap ───
SIZE_KB=$(du -sk . 2>/dev/null | awk '{print $1}')
if [[ ${SIZE_KB:-0} -gt 51200 ]]; then  # 50 MB
  jq -n --arg u "$URL" --argjson kb "$SIZE_KB" \
    '{ok:false, url:$u, error:"repo too large", size_kb:$kb}' > "$OUT"
  exit 4
fi

# Commit SHA for reproducibility (guard 11)
COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

# ─── Helper: is_binary <path> — file(1) mime charset check ───
is_binary() {
  case "$(file --brief --mime "$1" 2>/dev/null)" in
    *charset=binary*) return 0 ;;
    *) return 1 ;;
  esac
}

# ─── README extraction (12KB cap) ───
README_TEXT=""
README_SIZE=0
README_FOUND=false
for candidate in README.md readme.md README README.MD Readme.md README.rst; do
  if [[ -f "$candidate" && ! -L "$candidate" ]] && ! is_binary "$candidate"; then
    README_TEXT="$(head -c 12288 "$candidate")"
    README_SIZE=$(wc -c < "$candidate" | tr -d ' ')
    README_FOUND=true
    break
  fi
done

# ─── Tree (depth 3, 200 entries, no .git/node_modules etc) ───
TREE_TEXT="$(find . -maxdepth 3 \
  -path './.git' -prune -o \
  -path './node_modules' -prune -o \
  -path './dist' -prune -o \
  -path './build' -prune -o \
  -path './.next' -prune -o \
  -path './__pycache__' -prune -o \
  -path './target' -prune -o \
  -path './.venv' -prune -o \
  -type d -print -o -type f -print 2>/dev/null \
  | sed 's|^\./||' \
  | sort \
  | head -n 200)"

# ─── Dependency files ───
DEPS_JSON='{}'
for deps_file in package.json pyproject.toml requirements.txt Cargo.toml go.mod Gemfile pom.xml build.gradle composer.json; do
  if [[ -f "$deps_file" && ! -L "$deps_file" ]] && ! is_binary "$deps_file"; then
    file_size=$(wc -c < "$deps_file" | tr -d ' ')
    if [[ $file_size -le 262144 ]]; then  # 256KB cap (guard 7)
      content="$(cat "$deps_file")"
      DEPS_JSON="$(echo "$DEPS_JSON" | jq --arg k "$deps_file" --arg v "$content" '. + {($k): $v}')"
    fi
  fi
done

# ─── Entry file candidates (max 2, 200 lines each) ───
ENTRIES_JSON='{}'
ENTRY_COUNT=0
for entry in src/main.ts src/main.js src/main.py src/index.ts src/index.js app/page.tsx app/page.ts main.py main.go main.rs index.js index.ts cmd/main.go server.ts server.js; do
  [[ $ENTRY_COUNT -ge 2 ]] && break
  if [[ -f "$entry" && ! -L "$entry" ]] && ! is_binary "$entry"; then
    file_size=$(wc -c < "$entry" | tr -d ' ')
    if [[ $file_size -le 262144 ]]; then
      content="$(head -n 200 "$entry")"
      ENTRIES_JSON="$(echo "$ENTRIES_JSON" | jq --arg k "$entry" --arg v "$content" '. + {($k): $v}')"
      ENTRY_COUNT=$((ENTRY_COUNT + 1))
    fi
  fi
done

# ─── Skipped file accounting (guards 7+8+9+10) ───
TOTAL_FILES=$(find . \
  -path './.git' -prune -o \
  -path './node_modules' -prune -o \
  -path './dist' -prune -o \
  -type f -print 2>/dev/null | wc -l | tr -d ' ')
[[ $TOTAL_FILES -gt 300 ]] && TOTAL_FILES_CAPPED=300 || TOTAL_FILES_CAPPED=$TOTAL_FILES

SCANNED=$(echo "$ENTRIES_JSON" | jq 'length')
SCANNED=$((SCANNED + $(echo "$DEPS_JSON" | jq 'length')))
[[ $README_FOUND == true ]] && SCANNED=$((SCANNED + 1))
SKIPPED=$((TOTAL_FILES_CAPPED - SCANNED))
[[ $SKIPPED -lt 0 ]] && SKIPPED=0

# ─── Build final JSON ───
jq -n \
  --arg url "$URL" \
  --arg sha "$COMMIT_SHA" \
  --argjson readme_found "$README_FOUND" \
  --arg readme_text "$README_TEXT" \
  --argjson readme_size "$README_SIZE" \
  --arg tree_text "$TREE_TEXT" \
  --argjson deps "$DEPS_JSON" \
  --argjson entries "$ENTRIES_JSON" \
  --argjson total_files "$TOTAL_FILES" \
  --argjson skipped "$SKIPPED" \
  '{
    ok: true,
    url: $url,
    commit_sha: $sha,
    extraction_summary: {
      readme_found: $readme_found,
      readme_size: $readme_size,
      readme_truncated: ($readme_size > 12288),
      deps_files: ($deps | keys),
      entry_files: ($entries | keys),
      total_files: $total_files,
      scanned_files: (($entries | length) + ($deps | length) + (if $readme_found then 1 else 0 end)),
      skipped_files: $skipped
    },
    evidence: {
      readme: $readme_text,
      tree: $tree_text,
      deps: $deps,
      entries: $entries
    }
  }' > "$OUT"

echo "✓ fetch-repo: $URL → $OUT (commit $COMMIT_SHA, $TOTAL_FILES files, $SKIPPED skipped)"
