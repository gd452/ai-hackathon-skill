## 채널별 온보딩 메시지

### Slack 공지

```
:rocket: *{{HACKATHON_NAME}}* 안내
주제: {{TOPIC}}
일시: {{DATE_TIME}}
장소: {{VENUE}}
준비물: 노트북, 충전기, AI 도구 계정 ({{TOOLS}})
제출 양식: {{SUBMIT_LINK}}
문의: {{CONTACT}}

:scroll: 자세한 내용은 SPEC: {{SPEC_LINK}}
```

### Telegram 안내봇

```
🚀 {{HACKATHON_NAME}}

주제 · {{TOPIC}}
일시 · {{DATE_TIME}}
장소 · {{VENUE}}

당일 챙겨오세요
- 노트북 + 충전기
- AI 도구 계정 ({{TOOLS}})
- 신분증 (입퇴실용)

제출 → {{SUBMIT_LINK}}
SPEC → {{SPEC_LINK}}
문의 → {{CONTACT}}
```

### 이메일 (markdown 원본)

```
제목: [{{HACKATHON_NAME}}] 참가 확정 안내 ({{DATE}})

{{NAME}} 님 안녕하세요,

{{HACKATHON_NAME}} 참가가 확정되어 안내드립니다.

## 핵심 정보
- 일시: {{DATE_TIME}}
- 장소: {{VENUE}} ({{VENUE_DETAIL}})
- 도구 제약: {{TOOLS}}

## 준비
- 노트북 + 충전기
- 본인 계정으로 로그인된 AI 도구
- 신분증

## 제출
- 양식: {{SUBMIT_LINK}}
- 마감: {{DEADLINE}}
- README + 데모 영상(≤3분) 필수

## 심사
AI 1차 채점 → 상위팀 사람 심사. 자세한 rubric → {{SPEC_LINK}}

문의: {{CONTACT}}

감사합니다.
{{HOST}}
```
