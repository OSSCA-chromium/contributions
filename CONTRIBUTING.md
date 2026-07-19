# CONTRIBUTION GUIDE

## 공통

1. OSSCA-chromium/contributions 프로젝트 Fork
2. 로컬 환경에 Fork한 프로젝트 clone

```bash
$ git clone git@github.com:{본인 ID}/contributions.git
```

3. upstream (org repo) remote 추가

```bash
# 프로젝트 이동
$ cd contributions
# upstream remote 추가
$ git remote add upstream git@github.com:OSSCA-chromium/contributions.git
# upstream repo fetch
$ git fetch upstream
# 로컬 main 브랜치는 upstream 의 main 브랜치를 tracking 하도록 설정
$ git branch -u upstream/main
```

4. 브랜치 생성, 작업 후 origin(개인 repo)에 push

```
$ git checkout -b 250420-test
# commit 생성 후
$ git push origin 250420-test
```

5. Pull Request 생성

### 이 저장소의 commit message rule

이 저장소(contributions)에 커밋할 때는 변경 대상에 따라 semantic prefix를 붙입니다.

| 변경 대상                                                     | prefix                                      |
| ------------------------------------------------------------- | ------------------------------------------- |
| 사이트 코드 (`src/`, `scripts/`, 설정, 테스트)                | `feat:` `fix:` `refactor:` `chore:` `test:` |
| 프로그램 데이터 (`data/**` — contribution, 회의록, 문서 번역) | `data:`                                     |
| 저장소 문서 (README, CONTRIBUTING 등)                         | `docs:`                                     |

- prefix 뒤 제목은 현재형 동사(Add, Fix, Implement 등)로 시작, 첫 글자는 대문자, 마침표 없이
- 제목 다음에 빈 줄 하나, 본문은 72자에서 줄바꿈
- 예시: `feat: Add Google Analytics for production host`, `data: Add contribution 6721390`

Chromium Gerrit에 업로드하는 패치는 이 규칙이 아니라 아래 [commit message rule](#commit-message-rule)을 따릅니다.

## Chromium Issue 진행

### 이슈 생성 또는 기존 이슈 선택하기

- 새로운 컨트리뷰션을 시작하기 전에 먼저 [이슈 페이지](https://github.com/OSSCA-chromium/contributions/issues)를 확인해 주세요.
- 새로운 기능이나 버그 수정을 제안하고 싶다면 새 이슈를 생성해 주세요. 적절한 이슈 템플릿을 골라 작성하세요.
- 기존 이슈 중 작업하고 싶은 것이 있다면 댓글을 남겨 작업 의사를 밝혀주세요.

### 3주차 진행 전 할 것

1. CLA 동의하기 https://cla.developers.google.com/about/google-individual
2. 모든 건 실명으로 (영어이름 성)
3. https://chromium-review.googlesource.com 가입하기
4. git config user.name "실명 영어로"
5. git config.user.email "email 주소" (gerrit 가입 이메일과 동일해야 함)
6. 하고 싶은 이슈에 댓글 달기
7. 멘토가 이슈를 assign 하면 작업 진행
8. Checklist 내용을 진행하면서 작업한 내용을 댓글로 달기
9. 진행 상태에 따라 이슈의 Status 를 `멘티 작업 진행 중` -> `멘토 리뷰 중` -> `gerrit 리뷰 중` -> `반영 완료` 로 변경

#### Checklist

- [ ] src/AUTHORS 파일에 이름, 이메일 추가 (알파벳 순, gerrit, git 이메일과 동일)
- [ ] 마크다운 문서 로컬에서 확인해보기 `./tools/md_browser/md_browser.py` 실행 -> http://localhost:8080 에서 확인
- [ ] 이슈에 써 있는 부분 외에 추가로 깨진 부분 있는지 확인해보기 (다른 링크도 눌러보기)
- [ ] https://source.chromium.org/chromium 에서 깨진 링크를 갖고 있는 파일이 또 있는지 찾아보기
- [ ] 언제 어떤 코드(gerrit 주소)로 이 내용이 추가 또는 수정되었는지 찾기
- [ ] 수정한 파일과 AUTHORS 파일 포함해서 commit 만들기 -> commit 메시지 GitHub에 댓글로 달아서 멘토 확인받기
- [ ] commit 을 만든 후 `git cl upload` 으로 gerrit 에 업로드
- [ ] 업로드 후 해당 패치을 리뷰해줄 적절한 리뷰어 찾기 -> GitHub 댓글로 먼저 멘토에게 확인받기
- [ ] docs 폴더인 경우 멘토를 리뷰어에 추가 / 다른 폴더인 경우 CC로 추가
- [ ] 멘토 이메일 주소: eui-sang.lim@samsung.com

### commit message rule

이 규칙은 **Chromium Gerrit에 업로드하는 패치**에 적용됩니다. 이 저장소 커밋에는 [이 저장소의 commit message rule](#이-저장소의-commit-message-rule)을 따릅니다.

```
Summary of change (one line)

Longer description of change addressing as appropriate: why the change
is made, context if it is part of many changes, description of previous
behavior and newly introduced differences, etc.

Long lines should be wrapped to 72 columns for easier log message
viewing in terminals.

Bug: 123456
```

- 제목 다음에 빈 줄을 넣지 않으면 git log --oneline 등 한줄 이력을 볼 때 뒤에 내용이 다 붙는다.
- 제목에 `fix:` `feat:` `chore:` 와 같은 Semantic Commit Message 룰은 쓰지 않음
- 대신 `모듈 이름` 또는 `기능 이름`을 앞에 붙이는 경우가 있음
- `css: Fix something` 또는 `[CSS] Fix something` 또는 `Fix something`
- 앞에 `이름:` 를 붙이면 Gerrit 에서 `이름`이 태그로 추가 됨
- 문장 첫 단어는 동사(현재형), 첫 글자는 대문자로 시작, 뒤에는 마침표 없이
- Add, Fix, Implement 등등으로 시작
- 72 문자 후 줄바꿈

### 패치 Gerrit 업로드 후 진행

1. `data/contributions/template.md` 파일을 `data/contribtutions/{ChromiumReviewId}.md` 파일로 복사합니다.
2. 내용을 채우고 GitHub Pull Request 로 올려주세요.

## 웹사이트 실행 및 확인

1. Install

```bash
npm install
```

2. Run Dev Server

```bash
npm run dev
# 웹브라우저에서 localhost:3000/contributions 접속
```

3. Lint

```bash
npm run lint
```

4. Test

```bash
npm test
```

5. Build

```bash
npm run build
```
