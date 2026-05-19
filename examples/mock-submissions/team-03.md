# Team #03 — Code Review Bot

**제출자**: 익명
**GitHub repo**: https://github.com/example/code-review-bot
**데모 영상**: https://youtu.be/example-03 (unlisted, 2분 30초)

## README 발췌

```markdown
# Code Review Bot

PR 자동 코드리뷰 도구. 프로젝트 컨텍스트 (CLAUDE.md / SPEC.md / 과거 PR) 를 함께 읽어
일반 리뷰봇보다 깊은 코멘트를 다는 게 목표.

## 설치

```bash
pip install code-review-bot
echo "ANTHROPIC_API_KEY=sk-..." > .env
echo "GITHUB_TOKEN=ghp_..." >> .env
code-review-bot --repo owner/repo
```

## 사용
- GitHub Actions 통합 (`.github/workflows/review.yml` 제공)
- CLI 직접 호출도 가능
- 데모: `examples/demo-pr-42/` 폴더

## AI 활용
- **Claude API + Codex CLI 비교 사용**. 어느 쪽이 어느 코드 패턴에 강한지 분석 보고서 (`docs/comparison.md`) 동봉.
- **prompt 7개 공개**: `prompts/` 폴더 (review-instructions, context-loader, etc).

## 한계
- 대규모 PR (≥ 500 라인) 은 컨텍스트 초과 시 잘림.
- 비영어 코멘트는 한국어 / 영어만 지원.
- 보안 취약점 스캐닝 X — 기능/품질 리뷰만.
- false positive: 의도적인 코드 스타일 위반 (예: legacy 호환) 을 지적할 수 있음 (4 사례 명시).
```

## 정적 분석 결과

- 언어: Python (100%)
- lint 통과: ✅ (ruff, mypy)
- 테스트: 12건, coverage 95%
- 평균 함수 길이: 18 라인
- 주석 비중: 14%
- AI 도구 명시: ✅ (Claude + Codex 비교)
- prompt 공개: ✅ (7개)
- 한계 인지: ✅ (4 사례 + 비영어 + 대규모 PR)

## 데모 영상 transcript (2분 30초)

"Code Review Bot 입니다. 기존 리뷰봇 한계는 컨텍스트 부족. 이 봇은 CLAUDE.md / SPEC.md / 과거 PR 까지 함께 읽어요. (40초) 실제 PR #42 에 적용한 예시 보여드릴게요. 다른 봇은 '이 함수 너무 깁니다' 라고 코멘트하는데, 이 봇은 '이 함수는 SPEC.md 의 `parseConfig` 와 의도적으로 같은 형태로 작성된 듯합니다. 다만 CLAUDE.md 의 함수 길이 30 라인 룰 위반 — 변경 의도가 있다면 PR 본문에 명시 권장' 까지 갑니다. (1분 30초) 5개 PR 적용 시연 끝. 마지막으로 Claude vs Codex 비교표 보여드릴게요 — Claude 는 context 이해 강함, Codex 는 코드 패턴 검출 강함. CI 통합은 TODO 입니다. 감사합니다."

## 차별점 (자기 어필)

- 기존 리뷰봇 (Sweep, Codium 등) 대비 **프로젝트 컨텍스트 통합 리딩** 이 차별점.
- 8시간 안에 5개 실제 PR 에 적용 시연 완료. CI 통합은 미완 (TODO 명시).
