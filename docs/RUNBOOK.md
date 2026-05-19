# RUNBOOK — 운영자가 자기 환경에 적용하는 가이드

이 문서는 **AI 해커톤 운영자가 자기 회사 / 학교 / 동호회 환경에 이 스킬을 적용** 하는 단계별 가이드.

## 0. 사전 준비 (한 번만)

### 0.1 시스템 의존성

```bash
# Mac (Homebrew)
brew install jq curl bun
# Linux (apt)
sudo apt install jq curl
# Bun → https://bun.sh
```

LLM CLI 별도 설치 불필요 — 3 모델 (Claude · Gemini · OpenAI) 모두 curl 로 API 직접 호출.

### 0.2 API 키 — `.env.local` 한 곳에 작성

스킬은 키를 코드에 박지 않고 **환경변수로만** 사용. dashboard 가 Next.js 의 `.env.local` 을 자동 로드하므로, operator 는 이 파일 하나만 만들면 끝.

```bash
cd ai-hackathon-skill/dashboard
cat > .env.local <<'EOF'
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
OPENAI_API_KEY=sk-...
EOF
chmod 600 .env.local
```

키 발급 (각 1~2분):
- ANTHROPIC: [console.anthropic.com](https://console.anthropic.com) → API Keys
- GEMINI: [aistudio.google.com](https://aistudio.google.com) → Get API key
- OPENAI: [platform.openai.com](https://platform.openai.com/api-keys)

`.env.local` 은 `.gitignore` 로 자동 제외 (실수로 commit X). CLI 스크립트만 단독 호출할 때도 같은 키가 환경변수로 필요하면 `source dashboard/.env.local` 또는 셸 rc 에 영구 export.

### 0.3 스킬 설치 (Claude Code 와 통합 시)

dashboard 만 띄워서 운영할 거면 이 단계 생략 가능. Claude Code 가 스킬을 자동 매칭해주길 원하면:

```bash
# 옵션 A — 글로벌 (모든 Claude Code 세션에서 자동 매칭)
ln -s $(pwd)/ai-hackathon-skill ~/.claude/skills/ai-hackathon

# 옵션 B — 프로젝트별
mkdir -p .claude/skills && ln -s $(pwd)/ai-hackathon-skill .claude/skills/ai-hackathon
```

## 1. 행사 기획 (D-21 ~ D-7)

### 1.1 SKILL invoke

운영자의 Claude Code 안에서:
```
"ai-hackathon 스킬로 우리 회사 해커톤 운영 자료 만들어줘."
```

또는 슬래시:
```
/ai-hackathon
```

Claude Code 가 입력 받아 `templates/hackathon_spec.md` + `templates/onboarding_message.md` 채워서 출력.

### 1.2 운영 항목 채우기 (사람 영역)

스킬 출력의 운영 체크리스트 채우기:
- 장소 / 식사 / 인터넷 / 전원 / 안전 / 사진동의 / 스폰서 노출 / 시상품 수령

## 2. 참가 신청 / 안내 (D-21 ~ D-7)

### 2.1 참가 신청 폼

스킬은 폼 시스템을 직접 만들지 않음. operator 가 자기 회사 환경에 맞게:

| 옵션 | 장점 | 한계 |
|---|---|---|
| **Google Form** | 무료, 빠름, 익숙함 | 디자인 제약, 회사 도메인 강제 정책 시 막힘 |
| **Tally / Typeform** | 디자인 우수, 조건 분기 | 무료 한도 |
| **Notion DB + 공유 링크** | 노션 쓰는 팀에 자연 | 폼 UX 약함 |
| **자체 웹 폼** (Next.js + Vercel) | 풀 컨트롤 | 개발 시간 |

권장 시드 항목:
- 이름 (또는 익명 ID)
- 연락처 (Slack / Telegram username)
- 직무 / 경력 (옵션)
- 사용할 AI 도구
- 결과 공개 동의 (Y/N)

### 2.2 안내 메시지 발송

스킬이 생성한 `output/onboarding_messages.md` 에 Slack / Telegram / 이메일 3 변형. operator 채널에 맞춰 발송.

## 3. 해커톤 당일 (D-Day)

### 3.1 입장 / Wi-Fi / 안내

사람 영역. 스킬과 무관.

### 3.2 제출 양식 안내

참가자가 제출해야 할 내용:
- GitHub repo URL (public 또는 unlisted)
- README.md (설치 / 사용 / AI 활용 / 한계 명시)
- 데모 영상 URL (YouTube unlisted, ≤ 3분)
- 데모 영상 transcript (선택, AI 채점 정확도 향상)

제출은 Google Form 등으로 수집 → 운영자가 팀별 markdown 파일 정리 (형식은 `examples/mock-submissions/team-01.md` 참고).

## 4. AI 채점 (제출 마감 직후)

### 4.1 제출물 정리 (사전 처리)

각 팀이 제출한 markdown 을 형식에 맞게 정리하고, "체크 항목" 섹션이 비어 있으면 팀에게 채워달라고 요청 (사용한 AI 도구·프롬프트 공개·테스트 여부·남은 한계).

코드 품질을 더 정밀하게 평가하고 싶은 운영자는 선택적으로 lint·테스트 결과를 별도 캡처해 markdown 에 첨부할 수 있다 (개발 친화 행사 한정).

### 4.2 3 모델 채점 실행

```bash
mkdir -p /tmp/judge-output
for sub in submissions/*.md; do
  ./scripts/judge-submission.sh --submission "$sub" --out /tmp/judge-output
done
```

각 팀별로 `team-XX.rubric.md` (3 모델 점수 + AI 평균 + AI 종합) 생성.

소요 시간: 팀당 ~30~60초 (모델 응답 속도 + 병렬 호출).

### 4.3 트러블슈팅

| 증상 | 원인 / 대응 |
|---|---|
| `ANTHROPIC_API_KEY not set` | `export ANTHROPIC_API_KEY=...` 후 재실행 |
| `GEMINI_API_KEY not set` | `.env.local` 에 키 추가 후 `source dashboard/.env.local` |
| Gemini 응답이 JSON 이 아님 | maxOutputTokens 부족 (4096 미만) — `JUDGE_MODEL_GEMINI` 모델 변경도 시도 |
| `OPENAI_API_KEY not set` | `.env.local` 에 키 추가 후 source 재실행 |
| OpenAI `unsupported parameter` | 신형 모델은 `max_tokens` → `max_completion_tokens`, temperature 미지원. 모델명 override (`JUDGE_MODEL_OPENAI=gpt-4o` 등) |
| 일부 모델만 fail | 부분 rubric 은 정상 생성 — 결측 모델 점수만 0 처리. 재실행 시 해당 JSON 만 갱신 |

## 5. 동료 평가 수집

### 5.1 폼 설계

각 참가자가 자기 팀 제외 다른 팀들 평가. 권장 항목:
- 5 평가 축 (스킬 rubric 과 동일 또는 단순화) — 0~10 점
- 코멘트 (선택)

### 5.2 점수 집계

JSON 으로 변환:
```json
{
  "team-01": 78,
  "team-02": 55,
  "team-03": 88
}
```

값은 0~100 점 (다른 참가자 평균 × 10 등). 운영자 정책에 따라 가공.

## 6. 심사위원 평가

심사위원 패널이 다음을 입력으로 받음:
- 각 팀 `team-XX.rubric.md` (AI 3 모델 채점)
- 동료 평가 JSON
- 각 팀 GitHub repo + 영상 직접 확인

심사위원 점수를 같은 형식 JSON 으로:
```json
{
  "team-01": 82,
  "team-02": 60,
  "team-03": 90
}
```

## 7. 리더보드 생성 + 결과 발표

### 7.1 빌드

```bash
./scripts/build-leaderboard.sh \
  --rubric-dir /tmp/judge-output \
  --out /tmp/judge-output/leaderboard.md \
  --peer /path/to/peer-scores.json \
  --judge /path/to/judge-scores.json \
  --w-ai 40 --w-peer 30 --w-judge 30
```

가중치는 행사 성격에 맞게:
- 학회 / 동료 평가 중심: `--w-ai 30 --w-peer 50 --w-judge 20`
- 기업 / 심사위원 중심: `--w-ai 30 --w-peer 20 --w-judge 50`
- 균형: 40 / 30 / 30 (기본값)

### 7.2 발표

`leaderboard.md` 를 Slack / Notion / 이메일 등으로 공유. 익명 공개 정책 명시 (참가 등록 시 동의 안 한 팀은 `team-NN` 으로 표기).

## 8. 사후 (D+7)

- 우승팀 시상 (이체 또는 현장)
- 사진 / 영상 정리 (참가 동의 확인 후)
- 회고 (운영자 자신 + 참가자 설문)
- 결과 / 우수 prompt 공개 (참가자 동의 시) → 다음 회차 입력

---

## 회사별 시스템 연동 가이드

회사 내부 시스템과 연동할 때 자체 구현이 필요한 부분:

### 인증 / 가입
- 회사 SSO (SAML / OIDC) → 참가 신청 폼 게이트
- 사번 검증 / 부서 필터

### 데이터 저장
- 제출물 / 점수 / 리더보드를 자체 DB 에 영구 보관
  - Postgres / MySQL — 회사 표준 DB
  - Firebase / Supabase — 빠른 셋업
  - SharePoint / Notion — 운영팀 친숙

### 알림
- Slack workflow → 결과 자동 알림
- 회사 이메일 시스템 → 일괄 발송
- Telegram bot (이 가이드 외 별도 setup-telegram-bot 스킬 참고)

이 부분은 회사마다 환경이 달라 스킬이 직접 구현하지 않음. **샘플 코드는 스킬 외부 (참가자 개인 dev 머신) 에서 검증**.
