# AI 해커톤 제출물 — Team 03

당신은 AI 해커톤 참가자입니다. 혼자 짧은 시간 안에 만들었다고 가정하고 다음 제출물을 markdown 하나로 작성하세요.

## 만들 프로덕트 — 텍스트 Diff CLI

두 텍스트 파일을 받아 줄 단위 차이를 보여주는 CLI 도구.

요구 사항:
- 입력: 파일 두 개 (`old.txt new.txt`)
- 출력: unified diff 형식 (`+` 추가, `-` 삭제, ` ` context)
- 색상 옵션 (`--color`)
- context 줄 수 조정 (`-C N`, 기본 3)
- 동일하면 exit 0, 차이 있으면 exit 1 (CI 친화)

언어 자유 (Python / Bash / Go 등).

## 출력 형식 — 아래 섹션들을 포함한 markdown 만 출력

실제 해커톤처럼: **코드는 GitHub repo 에 있다고 가정** (markdown 본문엔 박지 않음). 양식은 팀이 자기 입으로 작성하는 설명.

```markdown
# Team #03 — {팀명 직접 작명}

**GitHub repo**: https://github.com/example/{slug}
**Live URL**: https://{slug}.example.com
**데모 영상**: https://youtu.be/example (1분 이내)

## 프로젝트 설명

(어떤 프로덕트인가 · 누가 어떻게 쓰나 · 핵심 기능 3~5개 · 설치/사용법 한 줄 — 본인이 진짜 만든 것처럼 6~10 문장)

## 체크 항목

- 사용한 AI 도구:
- 프롬프트 공개 여부:
- 테스트 여부:
- 남은 한계:

## 데모 영상 transcript

(1분 분량 텍스트 — "안녕하세요, ... 만들었습니다 ..." 톤)

## 차별점

(한 줄 — 기존 솔루션 대비 신선함)
```

**중요**: 위 markdown 외 다른 텍스트나 코드 펜스 (``````) 로 전체를 감싸지 마세요. 코드는 GitHub repo 에 있다고 가정하고 본문엔 박지 마세요.
