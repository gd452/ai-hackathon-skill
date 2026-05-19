# E2E 테스트 보고서 — 2026-05-12

외부 사용자 페르소나 기준 end-to-end 흐름 검증. **목표**: 외부 사용자가 스킬 다운로드 → 사용 → 해커톤 환경 구성 → 결과물 제출 → AI 평가 → 동료 평가 → 심사위원 평가까지 한 번에 통과 가능한 상태인지.

## 결론

**전체 흐름 작동 ✓**. 단, 환경 키 (`ANTHROPIC_API_KEY` / `GEMINI_API_KEY`) 가 없으면 해당 모델 채점은 fail (0 점). Codex CLI 는 OAuth 라 키 없이도 동작.

## 검증 시나리오

### 0. 사전 준비 (외부 사용자가 한 번만)

```bash
brew install jq curl bun
git clone https://github.com/gd452/ai-hackathon-skill ~/Development/ai-hackathon
cd ~/Development/ai-hackathon/dashboard
bun install
```

API 키:
```bash
cat > .env.local <<'EOF'
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
EOF
chmod 600 .env.local
```

→ Codex 는 OAuth (`codex login`). Claude/Gemini 는 env 키.

### 1. dashboard 띄우기

```bash
bun run dev
# http://localhost:3000
```

**검증** (localhost:3001 에서 BASE_PATH=/console 로 테스트):
- `/console` 200 ✓ — 대시보드 (행사 정보 + 키 상태 + 가중치)
- `/console/submissions` 200 ✓ — 제출물 목록
- `/console/leaderboard` 200 ✓ — 리더보드 (빈 상태)
- `/console/config` 200 ✓ — 설정 폼

### 2. 행사 설정 (`/config`)

- 행사명 · 주제 · 일자 · 기간 · 참가자 수 입력
- 5 항목 가중치 (합 100% 자동 검증) — 기본 20/25/25/20/10
- 3 source 가중치 (합 100% 자동 검증) — 기본 40/30/30
- 저장 → `data/config.json` 자동 기록 ✓

### 3. 제출물 등록 (`/submissions`)

UI 폼으로 markdown 입력:
- 팀 ID: `team-01-e2e`
- 본문: `examples/mock-submissions/team-01.md` 그대로

또는 API 직접:
```bash
curl -sS -X POST http://localhost:3001/console/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"id":"team-01-e2e","content":"# Team #01\n..."}'
```

→ `data/submissions/team-01-e2e.md` 저장 ✓

### 4. AI 채점

UI "AI 채점" 버튼 또는 API:
```bash
curl -sS -X POST http://localhost:3001/console/api/judge \
  -H "Content-Type: application/json" \
  -d '{"id":"team-01-e2e"}'
```

**결과**:
- 🟣 Claude: FAIL (env 키 없음 — `{"error":"ANTHROPIC_API_KEY not set"}`)
- 🟦 Gemini: FAIL (env 키 없음 — `{"error":"gemini CLI failed: Please set an Auth method..."}`)
- 🟢 GPT (Codex): **OK** ✓ (OAuth, 키 불요)

Codex 실 응답 예시 (team-01 마라톤 사이드프로젝트 채점):
```json
{
  "scores": {"readme": 8, "code": 8, "ai_usage": 9, "completeness": 8, "differentiation": 7},
  "comments": {
    "readme": "설치·사용법·AI 활용·한계가 명확하지만 개발자용 로컬 실행/빌드 절차는 부족합니다.",
    ...
  },
  "overall": "전체적으로 README, AI 활용 투명성, 데모 일관성이 강한 제출물입니다.",
  "human_review_flags": ["실제 App Store 설치 가능 여부 및 데모와 동일 동작 검증", ...]
}
```

→ `data/output/team-01-e2e.rubric.md` 생성 (모델별 점수 + AI 평균 + AI 종합).

**오늘 발견 + 수정한 버그**:
- 초기 codex JSON 추출이 코드펜스만 지원 → 실 응답 (plain JSON) 시 빈 파일 생성 → 0 점
- Fix: `judge-submission.sh` 의 codex 추출 로직을 (1) 코드펜스 (2) plain JSON (3) embedded JSON-like substring 3 단계 fallback 으로

### 5. 동료 평가 (스킵 가능)

폼 시스템은 스킬 외부 (Google Form 등). 결과 JSON 으로 저장:

```bash
cat > data/peer-scores.json <<'EOF'
{
  "team-01-e2e": 78,
  "team-02": 55,
  "team-03": 88
}
EOF
```

→ leaderboard 생성 시 자동 인식 ✓ . **없으면 0 으로 처리됨** (스킵 가능).

### 6. 심사위원 평가

같은 형식 JSON:
```bash
cat > data/judge-scores.json <<'EOF'
{
  "team-01-e2e": 82,
  "team-02": 60,
  "team-03": 90
}
EOF
```

### 7. 리더보드 생성

UI "리더보드 생성" 버튼 또는 API:
```bash
curl -sS -X POST http://localhost:3001/console/api/leaderboard
```

→ `data/output/leaderboard.md` 생성 ✓ . 가중 합산 (AI 40 / 동료 30 / 심사 30) 으로 정렬.

## 발견된 이슈

### 🟢 작동 OK
- 폴더 구조 / Next.js dashboard / API routes
- 5 항목 + 3 source 가중치 UI 설정 / 합 100% 검증
- Codex OAuth → 실 AI 채점 가능 (1/3 모델)
- 동료 / 심사위원 점수 JSON 인식 + 가중 합산
- 리더보드 생성 + 정렬

### 🟡 한계 (운영자 환경 의존)
- Claude · Gemini 채점은 env 키 필수 (외부 사용자가 직접 발급)
- 키 없으면 해당 모델 0 점 → AI 종합 점수 왜곡 (Codex 만 30% 정도로 부족)
- → docs/RUNBOOK.md 의 키 발급 안내가 첫 사용자 onboarding 핵심

### 🔴 수정 완료
- judge-submission.sh 의 codex 응답 파싱 — plain JSON 미지원 (2026-05-12 fix)

## 외부 사용자 입장 5분 시연 시나리오

1. `bun run dev` 후 `/console` 열기 → 대시보드 (1분)
2. `/config` → 행사 정보 입력 + 저장 (1분)
3. `/submissions` → 폼에 mock team 추가 → "AI 채점" 클릭 (1분)
4. 30-60초 대기 → 채점 완료 → 점수 표시
5. `/submissions/team-01-e2e` → rubric 상세 (3 모델 점수 비교)
6. `/leaderboard` → 리더보드 생성 → 가중 합산 결과 (1분)

총 5~6 분. 실 환경 키 셋업되면 채점 신뢰도 ↑.

## 다음 우선순위 (운영자 피드백 받기 전)

- 🥇 Phase 3-A: YouTube URL → Whisper 자동 transcribe (운영자 사전 처리 부담 ↓)
- 🥈 Phase 3-B: 화면 캡처 multimodal AI 평가 (Vision API)
- 🥉 Phase 3-C: GitHub repo clone → 정적 분석 자동
- 🟦 dashboard에서 동료 평가 폼 자동 생성 (Google Form template)
- 🟦 결과 알림 (개인별 rubric Telegram bot)
