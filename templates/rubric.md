# {{TEAM_NAME}} 채점 결과 (다중 AI 종합)

> 자동 채점: {{TIMESTAMP}} · {{HACKATHON_NAME}}
> 채점 모델: 🟣 Claude ({{MODEL_CLAUDE}}) · 🟦 Gemini ({{MODEL_GEMINI}}) · 🟢 ChatGPT ({{MODEL_GPT}})
> ⚠️ 이 결과는 **사람 심사위원의 보조 도구**. 최종 시상 결정은 사람이. 🚩 이견 항목 우선 검토.

## 종합 점수: **{{TOTAL_SCORE}} / 100**

## 항목별

각 항목: **🟣 Claude / 🟦 Gemini / 🟢 GPT 점수 → 합의 점수**

### 1. README 충실도 — 가중치 {{W_README}}%
| 모델 | 점수 | 코멘트 |
|---|---|---|
| 🟣 Claude | {{S_README_CLAUDE}}/10 | {{C_README_CLAUDE}} |
| 🟦 Gemini | {{S_README_GEMINI}}/10 | {{C_README_GEMINI}} |
| 🟢 GPT | {{S_README_GPT}}/10 | {{C_README_GPT}} |
| **합의** | **{{S_README}}/10** {{FLAG_README}} | {{C_README_AGG}} |

신호: 설치 가이드 [{{X_README_INSTALL}}] · 사용법 [{{X_README_USAGE}}] · 데모 [{{X_README_DEMO}}] · 한계 [{{X_README_LIMIT}}]

### 2. 코드 품질 — 가중치 {{W_CODE}}%
| 모델 | 점수 | 코멘트 |
|---|---|---|
| 🟣 Claude | {{S_CODE_CLAUDE}}/10 | {{C_CODE_CLAUDE}} |
| 🟦 Gemini | {{S_CODE_GEMINI}}/10 | {{C_CODE_GEMINI}} |
| 🟢 GPT | {{S_CODE_GPT}}/10 | {{C_CODE_GPT}} |
| **합의** | **{{S_CODE}}/10** {{FLAG_CODE}} | {{C_CODE_AGG}} |

신호: lint {{X_LINT}} · 테스트 {{X_TEST}} ({{N_TEST}}건) · 평균 함수 {{N_FUNC_LEN}} 라인 · 주석 {{N_COMMENT_RATIO}}%

### 3. AI 활용도 — 가중치 {{W_AI}}%
| 모델 | 점수 | 코멘트 |
|---|---|---|
| 🟣 Claude | {{S_AI_CLAUDE}}/10 | {{C_AI_CLAUDE}} |
| 🟦 Gemini | {{S_AI_GEMINI}}/10 | {{C_AI_GEMINI}} |
| 🟢 GPT | {{S_AI_GPT}}/10 | {{C_AI_GPT}} |
| **합의** | **{{S_AI}}/10** {{FLAG_AI}} | {{C_AI_AGG}} |

신호: 사용 도구 명시 {{X_AI_DECLARED}} · prompt 공개 {{X_PROMPT}} · 한계 인지 {{X_LIMIT_AWARE}}

### 4. 완성도 — 가중치 {{W_COMPLETE}}%
| 모델 | 점수 | 코멘트 |
|---|---|---|
| 🟣 Claude | {{S_COMPLETE_CLAUDE}}/10 | {{C_COMPLETE_CLAUDE}} |
| 🟦 Gemini | {{S_COMPLETE_GEMINI}}/10 | {{C_COMPLETE_GEMINI}} |
| 🟢 GPT | {{S_COMPLETE_GPT}}/10 | {{C_COMPLETE_GPT}} |
| **합의** | **{{S_COMPLETE}}/10** {{FLAG_COMPLETE}} | {{C_COMPLETE_AGG}} |

신호: 동작 여부 {{X_RUN}} · 영상 일치 {{X_VIDEO_MATCH}}

### 5. 차별성 — 가중치 {{W_DIFF}}%
| 모델 | 점수 | 코멘트 |
|---|---|---|
| 🟣 Claude | {{S_DIFF_CLAUDE}}/10 | {{C_DIFF_CLAUDE}} |
| 🟦 Gemini | {{S_DIFF_GEMINI}}/10 | {{C_DIFF_GEMINI}} |
| 🟢 GPT | {{S_DIFF_GPT}}/10 | {{C_DIFF_GPT}} |
| **합의** | **{{S_DIFF}}/10** {{FLAG_DIFF}} | {{C_DIFF_AGG}} |

(사람 심사위원 평가 권장 — AI 는 가설만 제시. 차별성은 모델별 편차 가장 큰 항목)

### 6. 데모 영상 — {{S_VIDEO}}/10 (참고 점수, 종합 미반영)
{{C_VIDEO}}
신호: 길이 {{N_VIDEO_LEN}}초 (≤ 180 권장) · 시연 흐름 {{X_VIDEO_FLOW}}

## 합의 vs 이견 요약

| 항목 | 모델 점수 차 | 분류 |
|---|---|---|
| README | {{DIFF_README}} | {{CLASS_README}} |
| 코드 | {{DIFF_CODE}} | {{CLASS_CODE}} |
| AI 활용 | {{DIFF_AI}} | {{CLASS_AI}} |
| 완성도 | {{DIFF_COMPLETE}} | {{CLASS_COMPLETE}} |
| 차별성 | {{DIFF_DIFF}} | {{CLASS_DIFF}} |

차 ≤ 1 = 합의 (✅) · 차 ≥ 2 = 이견 (🚩 사람 심사 우선)

## AI 의 종합 의견

**🟣 Claude**: {{OPINION_CLAUDE}}

**🟦 Gemini**: {{OPINION_GEMINI}}

**🟢 GPT**: {{OPINION_GPT}}

## 사람 심사위원 검토 권장 항목

{{HUMAN_REVIEW_FLAGS}}
