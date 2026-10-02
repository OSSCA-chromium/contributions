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

| 필드               | 값                                      | 예                            |
| ------------------ | --------------------------------------- | ----------------------------- |
| `title`            | Gerrit에 올린 commit 제목 그대로        | `"Fix siso_tips.md link"`     |
| `date`             | CL을 처음 업로드한 날짜, `YYYY-MM-DD`   | `2026-07-25`                  |
| `author`           | 본인 GitHub ID                          | `amoseui`                     |
| `contribution_url` | `https://crrev.com/c/{ChromiumReviewId}` | `https://crrev.com/c/6520751` |
| `module`           | 아래 기준의 상위 기능 영역 하나         | `blink`                       |
| `kind`             | 변경 유형                               | `fix`                         |
| `keywords`         | 기존 검색어와 추가 검색어의 배열        | `["docs", "fix"]`            |
| `status`           | 최초 `in review`, 결과에 따라 갱신      | `in review`                   |
| `resolvedDate`     | 확인된 결과 날짜, `YYYY-MM-DD` (선택)   | `2026-08-01`                  |

- `module`은 기여한 코드 영역 하나를, `kind`는 `fix`, `feature`, `refactor`,
  `test`, `docs`, `cleanup` 등 변경 유형 하나를 적습니다. 세부 주제는
  `keywords`에 순서대로 적으세요. 기존 기록의 `labels`는 검색어 유지를 위해
  같은 순서로 `keywords`에 옮겼습니다. 새 기록에는 `labels`를 쓰지 않습니다.
- 새 CL은 `status: in review`로 시작합니다. 결과가 확정되면 `merged` 또는
  `abandoned`로 갱신합니다. CL을 중단했다면 본문에 시도한 접근과 중단 이유를
  적으세요.
- `resolvedDate`는 Gerrit에서 정확한 merge 또는 abandon 날짜를 확인한 경우에만
  추가하세요. `date`는 결과와 관계없이 최초 업로드 날짜로 유지합니다.
- `date`는 반드시 유효한 `YYYY-MM-DD` 형식이어야 합니다. 잘못된 날짜(예:
  `2025-05-D8`)는 CI에서 걸리고, 통과하더라도 목록 정렬을 조용히 깨뜨립니다.
- `author`는 기여자 페이지 링크와 아바타에 그대로 사용되므로 정확한 GitHub
  ID를 적으세요.
- **템플릿의 안내 주석(`# github.com/GitHubId`, `# Add XXXXX from ...` 등)은
  모두 지우세요.**

### 모듈 분류 기준

`module`은 **기여의 핵심 동작을 담당하는 상위 영역**입니다. 세부 디렉터리,
API 이름, 변경 유형을 새 모듈로 만들지 않습니다. 여러 영역을 수정한 경우
주된 동작이 바뀐 영역 하나를 선택하고, 보조 영역은 `keywords`에 기록합니다.
`AUTHORS`, 공통 빌드 설정이나 테스트 baseline만으로 모듈을 결정하지 않습니다.

| 값 | 범위 |
| --- | --- |
| `base` | 공통 자료 구조, 파일 감시 등 기반 라이브러리 |
| `blink` | DOM, CSS, 웹 API, 렌더링과 해당 기능의 WPT |
| `browser` | 브라우저 기능과 공용 기능 컴포넌트 |
| `content` | 브라우저·렌더러 프로세스 통합과 웹 콘텐츠 실행 |
| `devtools` | Chrome DevTools 프런트엔드 |
| `docs` | 공통 개발 문서와 빌드·테스트·개발 환경 가이드 |
| `extensions` | 확장 프로그램, WebView와 확장 API |
| `graphics` | GPU, Viz, 컴포지팅과 그래픽 출력 |
| `media` | 오디오·비디오 파이프라인과 코덱 |
| `network` | 네트워크 프로토콜, DNS와 네트워크 서비스 |
| `platform` | ChromeOS, 장치 연동과 원격 실행 |
| `security` | 암호화, 인증, 인증서, Safe Browsing과 샌드박스 |
| `storage` | 파일 시스템 저장소, 할당량과 저장소 데이터베이스 |
| `ui` | 공통 UI, Views, 접근성과 플랫폼 위젯 |
| `v8` | JavaScript·WebAssembly 엔진 |

- `net/dns`는 `network`, `components/viz`는 `graphics`,
  `chrome/browser/ash`는 `platform`으로 기록합니다.
- 특정 기능을 설명하는 문서는 해당 영역을 선택합니다. 예를 들어 샌드박스
  문서는 `security`, Views 예제 문서는 `ui`입니다. 공통 개발 가이드는 `docs`입니다.
- 저장소는 별도의 `repo`, 변경 유형은 `kind`, 세부 경로와 API 이름은
  `keywords`로 구분합니다. 예를 들어 독립 CSS WPT도 모듈은 `blink`이고,
  저장소는 `web-platform-tests/wpt`입니다.
- 기존 세부 모듈 값은 검색어를 잃지 않도록 `keywords`에 보존합니다.
  허용 목록을 늘릴 때는 기존 영역으로 분류할 수 없는지 먼저 검토합니다.

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

## 4. CL 결과가 확정되면 — status 갱신

Gerrit에서 CL이 merge되거나 abandon되면 후속 PR로 `status`를 갱신합니다.

```bash
git checkout main && git pull
git checkout -b 250801-merged-6520751
```

`data/contributions/6520751.md`의 frontmatter에서 `status: in review`를
결과에 따라 `status: merged` 또는 `status: abandoned`로 수정합니다.
Gerrit에서 정확한 결과 날짜를 확인했다면 `resolvedDate: YYYY-MM-DD`도
추가하세요. `date`는 업로드 날짜이므로 바꾸지 않습니다. 같은 방식으로
커밋·push·PR을 올립니다.

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
