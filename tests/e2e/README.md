# E2E 셀프 테스트 수트

스킬이 진짜 동작하는지 매번 검증하는 도구.

## 원리

```
3 빌더 모델           3 심사 모델 (병렬)         리더보드
─────────────         ──────────────────         ──────────
Claude  → team-01 ┐
Gemini  → team-02 ├──→  Claude · Gemini · GPT  ──→  순위 + 점수
OpenAI  → team-03 ┘
```

- **빌더**: 3 모델이 각자 다른 프로덕트 (단어 카운터 / 마크다운 TOC / 텍스트 diff) 를 만들어 제출
- **심사**: `scripts/judge-submission.sh` 가 3 모델로 채점 (운영 시 같은 흐름)
- **리더보드**: `scripts/build-leaderboard.sh` (peer/judge 는 더미 JSON)

산출물은 `data/submissions/` · `data/output/` 에 저장 → dashboard 가 같은 경로를 보기에 브라우저에서 시각 확인 가능.

## 사용

```bash
# 풀 사이클 (빌드 → 등록 → 심사 → 리더보드)
bash tests/e2e/run.sh

# 단일 팀만 빌드 (디버깅)
bash tests/e2e/build-team.sh \
  --team team-01 \
  --model anthropic \
  --prompt tests/e2e/prompts/team-01.md \
  --out data/submissions/team-01.md
```

`run.sh` 와 `build-team.sh` 가 `dashboard/.env.local` 을 자동으로 로드 — 별도 `source` 불필요. 키 3 개 (`ANTHROPIC_API_KEY` · `GEMINI_API_KEY` · `OPENAI_API_KEY`) 가 그 파일에 있으면 됨.

## 디렉토리

```
tests/e2e/
├── README.md           # 이 파일
├── prompts/
│   ├── team-01.md      # Claude → 단어 빈도 카운터 CLI
│   ├── team-02.md      # Gemini → 마크다운 TOC 생성기
│   └── team-03.md      # OpenAI → 텍스트 diff 도구
├── build-team.sh       # 한 팀 빌드 (LLM 호출)
└── run.sh              # 풀 사이클
```

## 회귀 검증

매 코드 변경 후 `bash tests/e2e/run.sh` 한 줄로:
- 빌더 3 모델 응답 정상
- 채점 스크립트 3 모델 호출 정상
- 리더보드 1·2·3위 산출 정상

순위 자체는 매번 약간 흔들릴 수 있으나 (LLM 응답 변동), 3팀 모두 채점 OK + leaderboard 생성 = 통과.
