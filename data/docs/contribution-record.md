---
title: 기여 기록하기
order: 5
group: 가이드
description: Gerrit CL 업로드 후 기여 내역을 이 사이트에 반영하는 절차
---

Gerrit에 CL을 올렸다면 기여 내역을 `data/contributions/`에 기록해 이 사이트에
반영합니다. 기록된 내역은 [기여 목록](/contributions/patches/)과
[통계](/contributions/stats/), 기여자 페이지에 자동으로 집계됩니다.

> 저장소 fork·clone·upstream 설정이 아직이라면
> [CONTRIBUTING.md](https://github.com/OSSCA-chromium/contributions/blob/main/CONTRIBUTING.md)의
> "공통" 섹션을 먼저 따라 하세요.

## 0. Gerrit 기본 설정 — 새 CL을 Work in Progress로 (최초 1회)

[Gerrit 설정](https://chromium-review.googlesource.com/settings/)의 Preferences에서
**Set new changes to "work in progress" by default**를 체크하세요.

- 체크해 두면 `git cl upload`로 올린 CL이 리뷰어에게 바로 노출되지 않는
  WIP(Work in Progress) 상태로 만들어집니다.
- 멘토에게 커밋 메시지와 변경 내용을 확인받은 뒤, Gerrit 화면에서
  **Start Review**를 눌러 리뷰를 시작합니다.

## 1. 기록 파일 만들기

`data/contributions/template.md`를 `{ChromiumReviewId}.md`로 복사합니다.

```bash
cp data/contributions/template.md data/contributions/6520751.md
```

`ChromiumReviewId`는 Gerrit URL의 마지막 숫자입니다.
예: `https://chromium-review.googlesource.com/c/chromium/src/+/6520751` → `6520751.md`

### frontmatter 작성 규칙

| 필드               | 값                                     | 예                          |
| ------------------ | -------------------------------------- | --------------------------- |
| `title`            | Gerrit에 올린 commit 제목 그대로       | `"Fix siso_tips.md link"`   |
| `date`             | CL 업로드 날짜, `YYYY-MM-DD`           | `2026-07-25`                |
| `author`           | 본인 GitHub ID                         | `amoseui`                   |
| `contribution_url` | `https://crrev.com/c/{ChromiumReviewId}` | `https://crrev.com/c/6520751` |
| `labels`           | 수정한 디렉터리 + 작업 성격            | `["docs", "fix"]`           |
| `status`           | `in review`, `merged`, `abandoned`              | `in review`                 |

- CL을 중단했다면 `status: abandoned`로 기록하고 본문에 시도한 접근과 중단 이유를 적으세요.
- `date`는 반드시 유효한 `YYYY-MM-DD` 형식이어야 합니다. 잘못된 날짜(예:
  `2025-05-D8`)는 CI에서 걸리고, 통과하더라도 목록 정렬을 조용히 깨뜨립니다.
- `author`는 기여자 페이지 링크와 아바타에 그대로 사용되므로 정확한 GitHub
  ID를 적으세요.
- **템플릿의 안내 주석(`# github.com/GitHubId`, `# Add XXXXX from ...` 등)은
  모두 지우세요.**

### 본문 작성

- 문제 설명 / 해결 내용 / 테스트 방법 / 배운 점 / 참고 자료 — 각 섹션의 안내
  문구를 실제 내용으로 교체합니다.
- 해당 사항이 없는 섹션(예: 문서 수정이라 테스트가 없는 경우)은 제거해도
  됩니다.
- 템플릿에 있는 `https://example.com` 같은 placeholder 링크는 반드시
  제거하세요.

## 2. 로컬 검증

PR을 올리기 전에 CI 검사 중 데이터 관련 두 가지를 로컬에서 돌려봅니다.
(CI는 이 외에 테스트·ESLint·빌드도 실행하지만, `data/contributions/`만
추가했다면 아래 두 가지가 통과하면 충분합니다.)

```bash
npm run validate:data   # frontmatter 검사
npm run lint:md         # 마크다운 린트
```

렌더링을 직접 확인하려면 `npm run dev` 실행 후
`http://localhost:3000/contributions/patches/`에서 본인 항목을 열어보세요.

## 3. PR 올리기

```bash
git checkout -b 250725-contribution-6520751   # 브랜치명: YYMMDD-주제
git add data/contributions/6520751.md
git commit -m "contributions: Add 6520751"
git push origin 250725-contribution-6520751
```

- 커밋 메시지: `data/contributions/` 변경은 **`contributions:` prefix**를
  사용합니다. 제목은 현재형 동사로 시작, 첫 글자 대문자, 마침표 없음.
- push 후 GitHub에서 본인 fork 페이지에 뜨는 **Compare & pull request**
  버튼을 누르거나, fork의 해당 브랜치에서 **Contribute → Open pull
  request**로 PR을 생성합니다.
- base가 `OSSCA-chromium/contributions`의 `main`인지 확인하세요 (본인 fork의
  `main`이 아닙니다).
- CI(테스트·린트·데이터 검증)가 통과하는지 확인하고, 실패하면 로그를 보고
  수정 커밋을 추가합니다.
- PR이 merge되면 사이트에 자동 배포됩니다(수 분 소요).

## 4. CL이 merge되면 — status 갱신

Gerrit에서 CL이 최종 merge되면, 후속 PR로 `status`만 갱신합니다.

```bash
git checkout main && git pull
git checkout -b 250801-merged-6520751
```

`data/contributions/6520751.md`의 frontmatter에서 `status: in review`를
`status: merged`로 수정한 뒤, 같은 방식으로 커밋·push·PR을 올립니다.

```bash
git commit -am "contributions: Mark 6520751 as merged"
git push origin 250801-merged-6520751
```

## 5. GitHub 이슈·프로젝트 보드

- 실습 이슈는 오른쪽 **Assignees**에 본인을 직접 지정(self-assign)해
  시작합니다 (이슈당 1인, 선착순).
- 담당한 GitHub 이슈에 **Gerrit CL 링크**와 **기여 기록 PR 링크**를 코멘트로
  남기세요.
- 진행 상태에 따라 프로젝트 보드(2026 Chromium Issues)의 **Status**를 직접
  변경하세요: `멘티 작업 진행 중` → `멘토 리뷰 중` → `gerrit 리뷰 중` →
  `반영 완료`.
- 이슈 close는 멘토가 처리합니다.

## 자주 하는 실수

작년(2025) 기록에서 실제로 반복됐던 실수들입니다.

1. **템플릿 주석 잔재** — `author: ppirabbang # github.com/GitHubId`처럼
   안내 주석을 지우지 않고 제출.
2. **placeholder 링크 방치** — 참고 자료에
   `[관련 문서 링크](https://example.com)`가 그대로 남음.
3. **섹션 내용 뒤바뀜** — "테스트 방법" 섹션에 배운 점을 작성하는 등 안내
   문구와 내용이 어긋남.
4. **status 미갱신** — CL은 merge됐는데 기록은 계속 `in review`로 남아 통계가
   틀어짐.
5. **커밋 메시지 형식** — `Create 6619930.md`, `Update 6508290.md` 같은 기본
   메시지 사용. `contributions: Add 6619930` 형식을 지켜주세요.
