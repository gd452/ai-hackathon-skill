# 제출 표준 — Standard 트랙 (v0.2)

이 스킬의 기본 제출 포맷. 운영자가 참가자에게 안내할 표준.

## 필수 (Required)

```
1. GitHub repo URL
   - public 또는 unlisted (운영자가 접근 가능해야 함)
   - 8 시간 작업의 모든 코드

2. README.md (repo 안)
   - 설치 가이드 (한 줄짜리도 OK)
   - 사용법 / 데모 시나리오
   - 사용한 AI 도구 명시 (필수)
   - 한계 / 알려진 이슈

3. 데모 영상
   - YouTube unlisted (또는 운영자가 합의한 호스팅)
   - 길이 ≤ 3 분
   - 핵심 시연 흐름 1 회
```

## 선택 (Optional — 평가 정확도 ↑)

```
4. Live URL (deploy 한 경우)
   - 메인 페이지가 작동해야 함
   - 로그인 없이 일부 화면이라도 접근 가능 권장

5. 화면 캡처 (3~5 장)
   - 영상에서 잘 안 보이는 핵심 화면
   - PNG 또는 JPG
   - 1280x720 이상

6. 영상 transcript
   - Whisper auto-transcribe 또는 본인 작성
   - 미제출 시 운영자가 자동 추출

7. AI prompt 로그
   - 사용한 prompt 5~10 개 정리
   - "AI 활용도" 항목 평가 정확도 ↑
```

## 제출 markdown 양식 (운영자에게 등록할 때)

각 팀별로 다음 markdown 한 파일 — `data/submissions/<team-id>.md` 또는 dashboard `/submissions` UI 로 입력:

```markdown
# Team #01 — 팀명

**GitHub repo**: https://github.com/team/repo
**데모 영상**: https://youtu.be/xxx (≤ 3분, unlisted)
**Live URL**: https://team-app.example.com  (선택)

## README 발췌

(repo 의 README.md 내용 붙여넣기)

## 체크 항목

- 사용한 AI 도구:
- 프롬프트 공개 여부:
- 테스트 여부:
- 남은 한계:

## 데모 영상 transcript

(텍스트)

## 화면 캡처 (선택)

(필요 시 캡처 N장 — 파일 경로 또는 외부 링크)

## 차별점 (자기 어필)

(한 두 줄)
```

## AI 평가가 보는 신호 (투명성)

각 평가 항목별로 AI 가 어떤 입력을 보는지:

| 평가 항목 | AI 가 보는 source |
|---|---|
| README 충실도 | README 본문 |
| 코드 품질 | README + 영상 transcript + 체크 항목 (테스트 · 한계 인지) |
| AI 활용도 | README + 영상 transcript (도구·prompt 공개 여부) |
| 완성도 | 영상 transcript + 캡처 (영상-실제 일치) |
| 차별성 | 영상 (본인 어필) + repo (실제 코드 검증) |

→ `rubric.md` 의 모델별 코멘트가 어떤 신호를 봤는지 명시.

## Advanced Track (선택) — Skill + App

기본 Standard 제출에 더해 **재사용 가능한 Skill 자산** 까지 제출하면 별도 평가 (보너스 점수 또는 별도 트랙).

```
8. skill/ 폴더 (선택)
    SKILL.md           # Anthropic Claude Skills 표준 frontmatter
    scripts/           # 자동화 스크립트 (선택)
    templates/         # 템플릿 (선택)
    references/        # 참고 자료 (선택)
```

Skill 평가 기준:
- frontmatter 형식 (name / description 명확성)
- 재사용 가능성 (다른 사람이 fork 해서 쓸 수 있는가)
- 문서 충실도 (사용법 명확성)
- 응용 앱과의 인과 관계 (Skill 이 실제 앱 구현에 쓰였나)

운영자가 행사 성격에 맞춰 Standard 단독 / Standard + Skill 보너스 / Skill+App Track 선택.

## 운영자 체크리스트 (제출 마감 직후)

```
[ ] 모든 팀의 repo URL 접근 가능 확인
[ ] 영상 URL 살아있고 길이 ≤ 3분 확인
[ ] 각 팀이 체크 항목 (AI 도구·프롬프트·테스트·한계) 작성했는지 확인
[ ] dashboard `/submissions` 에 각 팀 markdown 등록
[ ] AI 채점 실행 (각 팀별 "AI 채점" 버튼)
[ ] (선택) 동료 평가 폼 마감 + JSON 변환
[ ] (선택) 심사위원 평가 입력
[ ] `/leaderboard` "리더보드 생성" → 결과 발표
```
