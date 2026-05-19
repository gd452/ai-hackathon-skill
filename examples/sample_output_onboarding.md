# 참가자 온보딩 메시지 — 채널별 (sample)

> 운영자가 자기 행사명·일정·도메인으로 치환해서 사용.
> 변수: `{{EVENT_NAME}}` / `{{DATE}}` / `{{VENUE}}` / `{{SUBMIT_URL}}` / `{{CONTACT}}` / `{{HOST_NAME}}` / `{{SPEC_URL}}`
>
> 예시: `{{VENUE}}` = "본사 7층 컨퍼런스 룸" / `{{CONTACT}}` = "ops@example.com"

## Slack 공지

```
:rocket: *{{EVENT_NAME}}* 안내
주제: AI 시대의 1인 사이드프로젝트 — 8시간 안에 동작하는 무엇이든
일시: {{DATE}} 09:00 ~ 18:00
장소: {{VENUE}}
준비물: 노트북, 충전기, AI 도구 본인 계정 (Claude / Codex / Cursor / Copilot 등 자유)
제출 양식: {{SUBMIT_URL}}
문의: {{CONTACT}} ({{HOST_NAME}})

:scroll: 자세한 내용은 SPEC: {{SPEC_URL}}
```

## Telegram 안내봇

```
🚀 {{EVENT_NAME}}

주제 · AI 시대의 1인 사이드프로젝트 (8시간)
일시 · {{DATE}} 09:00–18:00
장소 · {{VENUE}}

당일 챙겨오세요
- 노트북 + 충전기
- AI 도구 본인 계정 (자유 선택)
- 신분증

제출 → {{SUBMIT_URL}}
SPEC → {{SPEC_URL}}
문의 → {{CONTACT}}
```

## 이메일 (markdown 원본)

```
제목: [{{EVENT_NAME}}] 참가 확정 안내 ({{DATE}})

{{PARTICIPANT_NAME}} 님 안녕하세요,

{{EVENT_NAME}} 참가가 확정되어 안내드립니다.

## 핵심 정보
- 일시: {{DATE}} 09:00 ~ 18:00
- 장소: {{VENUE}}
- 도구 제약: 자유 (Claude / Codex / Cursor / Copilot 모두 OK)

## 준비
- 노트북 + 충전기
- 본인 계정으로 로그인된 AI 도구 1종 이상
- 신분증 (입퇴실용)

## 제출
- 양식: {{SUBMIT_URL}}
- 마감: {{DATE}} 16:30
- README + 데모 영상(≤3분) 필수

## 심사
AI 1차 채점 → 상위 30% 사람 심사. 자세한 rubric → {{SPEC_URL}}

문의: {{CONTACT}} ({{HOST_NAME}})

감사합니다.
{{HOST_NAME}}
```

---

**예시 값으로 본 모습** (회사 X 의 사내 해커톤 가정):

```
{{EVENT_NAME}} = "X AI Hackathon 2026"
{{DATE}}       = "2026-05-23 (토)"
{{VENUE}}      = "본사 7층 컨퍼런스 룸"
{{SUBMIT_URL}} = "https://forms.gle/..."  (Google Form)
{{SPEC_URL}}   = "https://notion.so/..."  (Notion)
{{CONTACT}}    = "ai-events@example.com"
{{HOST_NAME}}  = "AI 교육팀"
```
