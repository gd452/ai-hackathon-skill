# Team #01 — Solo Marathon

**제출자**: 익명 (참가 등록 시 동의로 비공개 옵션)
**GitHub repo**: https://github.com/example/solo-marathon
**데모 영상**: https://youtu.be/example-01 (unlisted, 2분 50초)

## README 발췌

```markdown
# Solo Marathon

마라톤 훈련 일지를 GPS 트랙 + AI 코칭으로 자동 생성하는 사이드프로젝트.

## 설치
- iOS 17+, Apple Watch Series 7+
- App Store 에서 "Solo Marathon" 검색 → 설치
- 첫 실행 시 HealthKit + 위치 권한 허용

## 사용법
1. 훈련 시작 전 앱 열고 "기록 시작"
2. 달리기 끝나면 "기록 종료" → 자동 분석
3. AI 가 페이스·심박·체력 그래프 + 다음 훈련 추천 생성

## AI 활용
- Claude API (Haiku 4.5) — 일지 텍스트 생성
- prompt 5개 공개 → prompts/ 폴더

## 한계
- Garmin 등 외부 디바이스 미지원 (Apple-only)
- 마라톤 외 운동 (수영·자전거) 미지원
```

## 정적 분석 결과

- 언어: Swift (90%), Python (10% — 백엔드 prompt 처리)
- lint 통과: ✅ (SwiftLint, ruff)
- 테스트: 4건 (단위 + UI)
- 평균 함수 길이: 22 라인
- 주석 비중: 11%
- AI 도구 명시: ✅ (Claude API)
- prompt 공개: ✅ (5개)
- 한계 인지: ✅ (외부 디바이스 / 다른 운동 미지원 명시)

## 데모 영상 transcript (2분 50초)

"안녕하세요, Solo Marathon 입니다. 마라톤 훈련을 AI 와 함께 하는 앱이에요. 시연 시작합니다. (12초) 앱 켜고 '기록 시작' 누르면 GPS + 심박 자동 측정. 5분 달리기 시뮬레이션 보여드릴게요. (1분 30초) 끝났습니다. 자동 분석 화면 — AI 가 페이스 그래프 + '오늘은 강도 6, 내일은 회복일 5km 추천' 같은 코칭. 마지막으로 prompt 5개 GitHub 에 공개해뒀으니 fork 해서 자기 운동에 맞춰 쓸 수 있어요. 한계는 Apple 기기 한정 + 마라톤 외 운동 미지원. 감사합니다."

## 차별점 (자기 어필)

- 기존 마라톤 앱 (Strava, Nike Run Club) 은 데이터 기록 위주. 우리는 **AI 코칭 + 일지 자동 생성**.
- AI 가 사용자 패턴 학습해서 개인 맞춤 훈련 추천.
- 8시간 안에 작동하는 v0.1 제작.
