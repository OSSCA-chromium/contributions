---
title: Chromium에 기여하기
order: 21
group: 번역 · docs
description: 기여 절차 공식 문서 전체 번역
source_path: docs/contributing.md
source_sha256: 7c0cfeb42c17708fcdb558264d18c7707de0d4fb23269d6bfe5f96b96e4311f1
translation_status: full
---
> 이 문서는 **Contributing to Chromium**([`docs/contributing.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/contributing.md)) 문서의 한국어 전체 번역입니다.

이 페이지는 작동하는 Chromium [체크아웃 및 빌드][checkout-and-build]가 있다고 가정합니다.
전체 Chromium 체크아웃에는 [v8][v8-dev-guide] 및 [Skia][skia-dev-guide]처럼
기여를 위한 자체 워크플로를 가진 외부 저장소가 포함된다는 점에 유의하세요.
마찬가지로 Chromium을 하위 저장소로 포함하는 ChromiumOS에는 자체 [개발 워크플로][cros-dev-guide]가 있습니다.


## 관련 리소스

- [Chromium 개발자의 일생][life-of-a-chromium-developer]은 대부분 최신 상태입니다.
- 커미터 에머리터스 noms@chromium.org의 [튜토리얼][noms-tutorial].
- Gerrit에서 각 CL을 제출하기 전에 거치면 유용한 체크리스트인 [커밋 체크리스트][commit-checklist].

## 소통하기

새 기능을 작성하거나 기존 버그를 수정할 때는 너무 멀리 진행하기 전에
다른 의견을 구하세요. 새 기능 아이디어라면 적절한 [토론 그룹][discussion-groups]에 제안하세요.
기존 코드베이스에 있는 것이라면 변경되는 코드의 "OWNERS" 파일에 있는 사람들 중 일부와
이야기하세요(자세한 내용은 [코드 리뷰 정책][code-reviews] 참조).

- 변경 사항에 CL 밖의 추가 맥락이 필요하다면 [버그 시스템][crbug]에서 추적해야 합니다.
  버그는 긴 히스토리, 논의와 토론, 스크린샷 첨부, 다른 관련 버그 링크에 적합한 장소입니다.
  이러한 것들이 전혀 필요 없을 정도로 독립적인 변경에는 버그가 필요하지 않습니다.
- 버그가 없지만 있어야 한다면 [새 버그를 등록][crbug-new]해 주세요.
- 버그 시스템에 버그가 있다는 사실만으로 패치가 반드시 받아들여진다는 뜻은 아닙니다.

## 설계 문서
Chromium에 중대한 영향을 미칠 모든 사소하지 않은 기술적 작업에는 설계 문서([템플릿][design-doc-template])가 있어야 합니다.
구체적으로 다음 경우에는 설계 문서를 요구합니다.
- Chromium 전체에 큰 영향을 미칠 코드를 작성할 때. 예를 들어 Chromium의 핵심 경로(페이지 로딩,
  렌더링)에 있는 코드를 변경하는 경우.
- 역사적 이유로 문서화되어야 하는 대규모 기술 작업을 시작할 때(일반적인 지침으로 1인월을 초과하는 작업을 사용할 수 있음).

공개 설계 문서는 [chromium-design-docs@chromium.org][chromium-design-docs]로 보내세요.
Google 내부 Chrome 설계 문서는 [go/chrome-dd-review-process][chrome-dd-review-process]의 절차를 따라야 합니다.

## 법적 사항

모든 기여자는 유효한 Gerrit/Google 계정을 보유해야 하며(즉, [자기 계정을 관리할 수 있을 만큼 충분한 나이](https://support.google.com/accounts/answer/1350409)여야 함),
기여자 라이선스 계약을 완료해야 합니다.

개인 기여자는 [개인 기여자 라이선스 계약][individual-cla]을 온라인으로 완료해 주세요.
기업 기여자는 [기업 기여자 라이선스 계약][corporate-cla]을 작성하여 해당 페이지에 설명된 대로 우리에게 보내야 합니다.

### 최초 기여자

본인(또는 본인 조직)의 이름과 연락처 정보를 [Chromium][cr-authors] 또는 [Chromium OS][cros-authors]의 AUTHORS 파일에 추가하세요.
이를 별도의 독립 패치로 제출하지 말고 첫 번째 패치의 일부로 포함해 주세요.

### 리뷰어를 위한 외부 기여자 체크리스트

chromium.org가 아닌 주소에서 온 변경에 LGTM을 주기 전에, 그 기여를 수락할 수 있는지 확인하세요.

- 정의: "author"는 <https://chromium-review.googlesource.com>에서 코드 리뷰 요청을 소유한 이메일 주소입니다.
- 작성자가 이미 [AUTHORS][cr-authors]에 등재되어 있는지 확인하세요. 어떤 경우에는 작성자의 회사가 와일드카드 규칙(예: \*@google.com)을 가지고 있을 수 있습니다.
- 작성자 또는 그 회사가 등재되어 있지 않다면, CL에는 새로운 AUTHORS 항목이 포함되어야 합니다.
  - 새 항목이 Google에서 일하는 리뷰어의 리뷰를 받았는지 확인하세요.
  - 기여자 라이선스 계약은 Googler가 http://go/cla 에서 확인할 수 있습니다.
  - 작성자 회사의 기업 CLA가 있는 경우, 그 CLA에는 해당 사람이 명시적으로 나열되어 있어야 합니다
    (또는 승인된 기여자 목록에 "All employees"와 같은 문구가 있어야 합니다). 작성자가 회사 명단에 없으면 변경을 수락하지 마세요.

## 초기 git 설정

1. [Gerrit 접근](https://chromium.googlesource.com/chromium/src/+/main/docs/gerrit_guide.md)을 설정합니다.
2. git에 본인의 이름, 이메일 및 몇 가지 다른 설정을 알려줍니다.
   ```
   git config --global user.name "My Name"
   git config --global user.email "myemail@chromium.org"
   git config --global core.autocrlf false
   git config --global core.filemode false
   git config --local gerrit.host true
   # pull 명령이 항상 rebase하도록 하려면 이 줄의 주석을 해제하세요.
   # git config --global branch.autosetuprebase always
   # 새 브랜치가 현재 브랜치를 추적하도록 하려면 주석을 해제하세요.
   # git config --global branch.autosetupmerge always
   ```
3. <https://chromium-review.googlesource.com/settings/>를 방문하여 선호 이메일이 git 설정에서 사용하는 이메일과 동일하게 설정되어 있는지 확인합니다.

## 변경 만들기

먼저 git에서 변경을 위한 새 브랜치를 만듭니다. 여기서는 `mychange`라는 브랜치를 만들며(여기서는 원하는 이름을 사용해도 됨),
`origin/main`을 업스트림 브랜치로 사용합니다.

```
git checkout -b mychange -t origin/main
```

변경을 작성하고 테스트합니다.

- [스타일 가이드][cr-styleguide]를 따르세요.
- 테스트를 포함하세요.
- 패치는 리뷰하기에 합리적인 크기여야 합니다. 리뷰 시간은 종종 패치 크기에 따라 기하급수적으로 증가합니다.

변경을 로컬 git에 커밋합니다.

```
git commit -a
```

`git`에 익숙하지 않다면 GitHub의 [git 학습 리소스][github-tutorial]가 기본을 익히는 데 유용합니다.
하지만 Chromium 워크플로는 GitHub 풀 리퀘스트 워크플로와 같지 않다는 점을 명심하세요.

## 리뷰를 위해 변경 업로드하기

참고: 변경이 의존 프로젝트에 대한 것이라면 [의존성 변경](https://chromium.googlesource.com/chromium/src/+/main/docs/dependencies.md#changing-dependencies) 문서를 보세요.
그렇지 않다면 리뷰를 위해 변경을 업로드하기 전에 Chromium의 [커밋 체크리스트][commit-checklist]를 거치세요.

Chromium은 코드 리뷰를 위해 <https://chromium-review.googlesource.com>에서 호스팅되는 Gerrit 인스턴스를 사용합니다.
로컬 변경을 Gerrit에 업로드하려면 [depot\_tools][depot-tools-setup]의 `git-cl`을 사용하여
현재 브랜치와 그 업스트림 브랜치 사이의 diff를 기반으로 새 Gerrit 변경을 만듭니다.

```
git cl upload
```

그러면 새 변경에 대한 설명을 만들기 위해 텍스트 편집기가 열립니다.
이 설명은 변경이 Chromium 트리에 랜딩될 때 커밋 메시지로 사용됩니다.
설명은 다음과 같이 형식을 맞춰야 합니다.

```
변경 요약(한 줄)

필요에 따라 다음을 다루는 더 긴 변경 설명: 변경이 이루어진 이유,
여러 변경의 일부인 경우의 맥락, 이전 동작과 새로 도입된 차이의 설명 등.

터미널에서 로그 메시지를 더 쉽게 보기 위해 긴 줄은 72열에서 줄바꿈해야 합니다.

Bug: 123456
```

짧은 제목과 제목 뒤의 빈 줄은 매우 중요합니다. `git`은 이를 `git log --oneline` 같은 도구의 휴리스틱으로 사용합니다.
[이슈 트래커][crbug]의 버그 번호를 사용하세요([CL 푸터 문법](#cl-footer-reference)에 대한 자세한 내용 참조).
좋은 커밋 설명을 작성하기 위한 더 심층적인 팁이 있는 [Git 커밋 메시지 작성 방법][good-git-commit-message]도 보세요.

### Chromium별 설명 팁

- 이전 CL에 대한 링크는 `https://crrev.com/c/NUMBER` 형식으로 작성해야 하며,
  이는 <https://chromium-review.googlesource.com>보다 약간 더 짧습니다.

- 테스터가 변경이 올바른지 확인하기 위한 지침이 있다면 `Test:` 태그와 함께 포함하세요.

  ```
  Test: Load example.com/page.html and click the foo-button; see
  crbug.com/123456 for more details.
  ```

변경 설명을 저장한 후 `git-cl`은 일반적인 오류를 확인하기 위해 몇 가지 presubmit 스크립트를 실행합니다.
모든 것이 통과하면 `git-cl`은 다음과 같은 내용을 출력합니다.

```
remote: SUCCESS
remote:
remote: New Changes:
remote:   https://chromium-review.googlesource.com/c/chromium/src/+/1485699 Use base::TimeDelta::FromTimeSpec helper in more places. [WIP]
```

리뷰어, 변경으로 수정되는 버그 등을 지정하기 위해 추가 플래그를 사용할 수 있습니다.

```
git cl upload -r foo@example.com,bar@example.com -b 123456
```

[Issue 461824120][issue-461824120]에 문서화된 것처럼,
때때로 `git cl upload`는 사용자에게 다음과 비슷한 메시지와 함께 실패합니다.
```
error: RPC failed; HTTP 401 curl 22 The requested URL returned error: 401
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```
한 가지 해결책은 잠시 기다린 다음 최신 브랜치를 pull하고 `gclient sync`를 실행하는 것입니다.
또는 `git config`를 사용하여 문제를 즉시 해결할 수 있습니다.
```
git config --global http.postBuffer 524288000
```

전체 플래그 목록은 `git cl help upload`를 보세요.

### 의존 변경 업로드하기

관련된 여러 변경을 메인에 랜딩될 때까지 기다리지 않고 작업하고 싶다면,
Gerrit에서 의존 변경을 사용하여 그렇게 할 수 있습니다.

예를 들어 기능 A에 대한 커밋이 있고 이것이 Gerrit에서 리뷰 중이라고 해 봅시다.
이제 그것이 main에 랜딩되기 전에 그 위에서 더 많은 작업을 시작하고 싶다고 해 봅시다.

Gerrit에는 “relation chain”이라는 개념이 있습니다. 위 예에서는 기능 A 변경이 기능 B 변경의 부모가 되는 relation chain을 만들고 싶습니다.
relation chain을 만들고 나면 변경 B의 Gerrit 리뷰 뷰는 main 브랜치와 비교한 diff가 아니라 변경 A와 비교한 diff를 보여줍니다.

relation chain을 만들려면 부모 CL과 연관된 업스트림 브랜치를 가진 변경을 업로드하세요.
이를 수행하는 단계는 부모 변경을 본인이 소유한 경우와 다른 사람이 소유한 경우에 약간 다릅니다.

#### 부모 변경을 본인이 소유한 경우

위의 기능 A와 B 예를 사용하여, 기능 A 변경을 본인이 소유하고 있고 기능 B에 대한 의존 변경을 업로드하려는 경우:

```
git checkout featureA
git checkout -b featureB
git branch --set-upstream-to featureA
# ... edit some files
# ... git add ...
git commit
git cl upload
```

#### 부모 변경을 다른 사람이 소유한 경우

다른 사람이 기능 A 변경을 소유한 경우:

```
# First, open the change for feature A in Gerrit -> "Download patch" -> copy and
# run "Branch" command. Then, starting from the branch that command created:
git cl patch --force <parent-CL-number>
git checkout -b featureB
git branch --set-upstream-to change-<parent-CL-number>
# ... edit some files
# ... git add ...
git commit
git cl upload
```

`git cl patch --force <parent-CL-number>`를 실행한 뒤 `change-<parent-CL-number>` 브랜치에서 변경을 업로드하면,
원래 작성자의 변경에 새 패치셋을 업로드하게 된다는 점에 유의하세요.

다른 작성자가 당신의 변경이 의존하는 변경에 새 패치셋을 업로드하면,
다음을 실행하여 그 변경의 로컬 복사본을 업데이트할 수 있습니다.

```
git checkout change-<parent-CL-number>
git fetch origin [sha hash for latest patchset] && git reset --hard FETCH_HEAD
```

## 코드 리뷰 {#code-review}

이 섹션은 코드 리뷰의 메커니즘과 절차를 설명합니다. 다음도 참조하세요.
- 커미터, OWNERS 및 기타 규칙에 대한 [코드 리뷰 정책](https://chromium.googlesource.com/chromium/src/+/main/docs/code_reviews.md) 페이지
- [행동 강령](https://chromium.googlesource.com/chromium/src/+/main/CODE_OF_CONDUCT.md)
- [존중하는 변경](https://chromium.googlesource.com/chromium/src/+/main/docs/cl_respect.md)
- [존중하는 코드 리뷰](https://chromium.googlesource.com/chromium/src/+/main/docs/cr_respect.md)

### 리뷰어 찾기

여기서 이 맥락의 "reviewer"는 CL에 대해 코멘트를 제공할 뿐 아니라
"Code-Review +1"을 제공하여 제출을 승인할 수 있는 사람이라는 점에 유의하세요.

리뷰어는 [커미터](https://www.chromium.org/getting-involved/become-a-committer/)여야 합니다.
이상적으로는 해당 코드 영역에 익숙한 커미터여야 합니다.
누가 적합한지 확실하지 않다면 가장 가까운 상위 OWNERS 파일에 있는 누구에게든 확인하세요.

- 영향을 받는 각 디렉터리마다 최소 한 명의 owner가 있어야 합니다.
- 리뷰어가 여러 명이라면 각 리뷰어가 무엇을 리뷰해야 하는지 명확히 하세요.
- `git cl owners`는 OWNERS 파일을 기반으로 리뷰어를 자동 제안합니다.

_참고:_ 기본적으로 각 파일에는 한 명의 리뷰어만 선택해 주세요(즉, 한 리뷰어가 여러 파일을 리뷰할 수 있지만,
일반적으로 각 파일은 한 사람만 리뷰하면 됩니다). "먼저 보는 사람이 리뷰하도록" 여러 리뷰어를 추가하고 싶은 유혹이 있을 수 있지만,
이는 두 가지 흔한 실패 모드를 가집니다.
- 리뷰어 Alpha와 Beta가 모두 CL을 리뷰하여 중복 노력이 발생합니다.
- 위 실패 사례를 우려하여 리뷰어 Alpha와 Beta 모두 CL을 리뷰하지 않습니다.

같은 파일에 대해 여러 리뷰어를 요청하는 것이 바람직할 때도 있습니다. 예를 들어 코드가 특히 복잡하거나,
파일이 여러 시스템을 사용하여 각 시스템의 관점이 가치 있을 때입니다. 이 경우 두 리뷰어 모두가 리뷰해 주기를 바란다는 점을 명시해 주세요.

Chromium 커미터가 아닌 변경 기여자가 chromium/src 저장소에 제출하는 경우,
제출에는 두 명의 커미터가 "Code-Review +1"을 해야 합니다. CL의 소유자가 이미 커미터라면,
다른 커미터 한 명의 "Code-Review +1"만 필요합니다.

### 리뷰 요청하기

[웹][crrev]에서 변경을 엽니다. 링크를 찾을 수 없다면 `git cl issue`를 실행하면 현재 브랜치의 리뷰 URL이 표시됩니다.
또는 <https://chromium-review.googlesource.com>를 방문하여 "Outgoing Reviews" 섹션을 확인하세요.

리뷰어는 컴파일되고 테스트를 통과하는 코드를 리뷰할 것으로 기대합니다.
접근 권한이 있다면 지금이 변경을 [자동 테스트](#running-automated-tests)에 돌리기 좋은 시점입니다.

페이지 상단 근처의 큰 파란색 **Start Review** 버튼을 클릭하세요. (로그인하지 않은 경우 버튼에는 대신 "Sign In"이라고 표시되므로,
클릭하여 로그인하세요.) 페이지 내 대화상자가 나타나고, 변경에 대한 리뷰어를 지정할 수 있는 **Reviewers** 필드가 있습니다.
필드 오른쪽, 페이지 내 대화상자의 오른쪽 위에는 "Suggest Owners"라는 링크가 있으며,
이를 클릭하면 변경과 관련된 owner를 제안합니다. 특별한 이유가 없다면 이를 클릭하고 owner 제안에 의존하는 것을 권장합니다.

같은 대화상자에서 리뷰어에게 보낼 선택적 메시지를 포함할 수 있습니다.
이 공간은 특정 질문이나 지침에 사용할 수 있습니다. 완료되면 반드시 **Send and Start Review**를 클릭하세요.
이렇게 해야 요청된 리뷰어에게 변경을 리뷰해야 한다는 알림이 갑니다.

**⚠️ 반드시 "Send and Start Review" 버튼을 클릭하세요. 그렇게 하기 전까지는 아무도 당신의 변경을 보지 않습니다 ⚠️**

### 리뷰 절차

모든 변경은 리뷰되어야 합니다([코드 리뷰 정책][code-reviews] 참조).

영업일 기준 **하루** 이내에 응답을 받아야 합니다. 그렇지 않으면 리뷰어에게 다시 ping하세요.

리뷰어의 코멘트를 반영한 새 패치셋을 업로드하려면, 로컬 브랜치에 추가 변경을 커밋하고 `git cl upload`를 다시 실행하면 됩니다.

### 승인

리뷰어가 변경에 만족하면 "Code-Review +1" 라벨을 설정합니다.
변경을 커밋할 수 있으려면 영향을 받는 모든 파일의 owner가 승인해야 합니다.
참조: [코드 리뷰 정책: owners][code-reviews-owners].

CL을 커밋할 수 있으려면 모든 코드 리뷰 코멘트가 resolved로 표시되어야 합니다.
어떤 경우에는 리뷰어가 추가 코멘트와 함께 "Code-Review +1"을 줄 수 있습니다.
이러한 코멘트는 처리하고 답변하거나, 적어도 ACK 버튼으로 확인하여 해결해야 합니다.
모든 코멘트를 해결할 수 없다면 커밋 메시지의 "Unresolved-Comment-Reason:" 절을 통해 override가 제공됩니다.

### 코드 리뷰 투표

CL 제출에는 작성자가 [커미터인지][becoming-a-committer]와 영향을 받는 파일에 따라 다른 승인이 필요합니다.

승인에는 두 가지 유형이 있습니다.
* Code-Review 승인. 이는 CL 전체에 적용되며 (작성자 본인을 제외한) 어떤 커미터든 부여할 수 있습니다.
  커미터는 Code-Review +1 승인 하나가 필요하고, 비커미터는 별도의 Code-Review +1 승인 두 개가 필요합니다.
* Code-Owners 승인. 파일에는 각기 다른 owner가 있으며, 이는 `OWNERS` 파일에 지정됩니다.
  모든 파일은 owner가 CL에 +1을 하거나 작성자가 해당 파일의 OWNER여야 합니다.

#### 새 패치셋으로 투표 복사하기

새 패치셋이 업로드되면 승인이 제거될 수 있습니다(이전 패치셋에서 승인을 받은 뒤 상당히 다른 미리 리뷰되지 않은 코드를 랜딩하는 것을 방지하기 위해).

일부 상황에서는 승인이 패치셋 간에 복사될 수 있습니다. 이를 "sticky" 투표 또는 승인이라고도 합니다.
* Code-Review 승인은 다음 경우 패치셋 간에 복사됩니다.
  * (Gerrit가 감지한) 사소한 rebase인 경우,
  * 커밋 메시지 변경인 경우, 또는
  * 작성자가 커미터이고 *수정된 파일 목록이 변경되지 않은* 경우
    (비커미터의 경우 어떤 코드 변경이든 Code-Review 승인을 잃게 됩니다).
* Code-Owners 승인은 *항상* 패치셋 간에 복사됩니다(리뷰어의 +1이 Gerrit에 더 이상 표시되지 않더라도).

패치셋이 승인을 잃으면, 해당 패치셋을 커밋할 수 있기 전에 승인을 다시 추가해야 합니다(커미터는 +1 하나, 비커미터는 +1 두 개).

## 자동 테스트 실행하기

제출되기 전에 변경은 커밋 큐(CQ)를 통과해야 합니다.
커밋 큐는 패치를 여러 플랫폼을 실행하는 여러 try bot으로 보내는 자동화 시스템입니다.
각 try bot은 패치를 적용한 Chromium을 컴파일하고 해당 플랫폼에서 테스트가 계속 통과하는지 확인합니다.

이 절차를 트리거하려면 코드 리뷰 도구의 오른쪽 위에서 **CQ Dry Run**을 클릭하세요.
이는 "Commit-Queue +1" 라벨을 설정하는 것과 동일합니다. 누구나 이 라벨을 설정할 수 있지만,
라벨을 설정한 사람이 [try job 접근 권한][try-job-access]을 가지고 있지 않으면 CQ는 패치를 처리하지 않습니다.

try job 접근 권한이 없고 다음에 해당한다면:

- @chromium.org 이메일 주소가 있다면, 본인을 위해 접근 권한을 요청하세요.
- 몇 개의 패치를 기여했다면, 리뷰어에게 접근 권한 후보로 추천해 달라고 요청하세요.
- 위 둘 다 해당하지 않는다면, 코드 리뷰 요청 메시지에서 리뷰어에게 대신 try job을 실행해 달라고 요청하세요.

주어진 패치셋의 최신 try job 상태는 변경된 파일 목록 바로 아래에서 볼 수 있습니다.
각 bot에는 자체 버블이 있으며, 다음 색상 중 하나로 상태를 나타냅니다.

- 회색: bot이 아직 패치 처리를 시작하지 않았습니다.
- 노란색: 실행 중입니다. 나중에 다시 확인하세요!
- 보라색: trybot이 패치를 처리하는 동안 예외를 만났습니다.
  보통 이는 패치의 잘못이 아닙니다. **CQ Dry Run**을 다시 클릭해 보세요.
- 빨간색: 테스트가 실패했습니다. 실패한 bot을 클릭하여 어떤 테스트가 왜 실패했는지 확인하세요.
- 초록색: 실행이 통과했습니다!

## 커밋하기

변경은 [커밋 큐][commit-queue]를 통해 커밋됩니다.
이는 오른쪽 위의 **Submit to CQ**를 클릭하거나 변경에 "Commit-Queue +2" 라벨을 설정하여 수행됩니다.
그러면 커밋 큐가 패치를 try bot으로 보냅니다. 모든 try bot이 초록색을 반환하면 변경은 자동으로 커밋됩니다. 좋습니다!

때때로 테스트가 flaky할 수 있습니다. 변경과 관련 없어 보이는 독립적인 실패가 있다면,
변경을 커밋 큐에 다시 보내 보세요.

긴급 상황에서는 커밋 접근 권한이 있는 개발자가 커밋 큐와 모든 안전망을 우회하여 변경을 [직접 커밋][direct-commit]할 수 있습니다.

## 변경 다시 랜딩하기

가끔 [커밋 큐][commit-queue]를 통과하여 Chromium에 제출된 변경이 나중에 revert될 수 있습니다.
이 일이 당신의 변경에 발생하더라도 **낙담하지 마세요**! 이는 Chromium 개발 주기의 흔한 일부일 수 있으며,
예상치 못한 변경과의 충돌이나 커밋 큐에서 커버되지 않은 테스트 등 다양한 이유로 발생합니다.

이 일이 당신의 변경에 발생했다면 reland를 추진하는 것이 권장됩니다. 그렇게 할 때 다음 기본 단계를 따르면 재리뷰 절차를 간소화할 수 있습니다.
- **reland 만들기**: Gerrit의 원래 변경에서 `Create Reland` 버튼을 클릭하세요.
  그러면 원래 변경과 diff가 동일하지만, 원래 변경으로 되돌아가는 작은 paper-trail이 커밋 메시지에 있는 새 변경이 생성됩니다.
  이는 gardener가 회귀를 디버깅할 때 유용할 수 있습니다. 그 버튼에서 오류가 발생하면 대신 revert CL의 `Revert` 버튼을 시도하세요.
  기능적으로는 동일해야 합니다.
- **수정 추가하기**: reland에 원래 변경에는 없던 파일 수정이 필요하다면, 이러한 수정을 reland 변경의 후속 패치셋으로 업로드하면 됩니다.
  첫 번째 패치셋과 최신 패치셋을 비교함으로써 리뷰어는 _오직_ reland 수정만의 diff를 볼 수 있습니다.
- **수정 설명하기**: reland 변경의 커밋 메시지에, 다시 랜딩해도 안전해진 이유가 되는 변경 사항을 간단히 요약하세요.
  설명에는 "필요한 수정 포함", "실패하는 테스트 비활성화", "크래시는 다른 곳에서 수정됨" 등이 포함될 수 있습니다.
  마지막 경우에 대해 구체적으로 말하면: reland 변경이 원래 변경과 동일하고 reland 수정이 앞선 변경에서 별도로 처리되었다면,
  reland의 커밋 메시지에 그 변경 링크를 반드시 포함하세요.

## 코드 지침

[스타일가이드][cr-styleguide]를 준수하는 것 외에도, 다음 일반적인 경험칙은 변경을 어떻게 구조화할지 탐색하는 데 도움이 될 수 있습니다.

- **Chromium 프로젝트의 코드는 Chromium 프로젝트의 다른 코드를 위해 존재해야 합니다.**
  이는 개발자가 설계 결정을 형성하는 제약 조건을 이해할 수 있도록 하는 데 중요합니다.
  이러한 제약 조건은 프로젝트와 여러 저장소의 경계 내 코드 범위에서 명백해야 합니다.
  일반적으로 각 코드 줄에 대해, Chromium 저장소 안에서 그 코드 줄에 의존하는 제품을 찾을 수 있어야 하며,
  그렇지 않다면 그 코드 줄은 제거되어야 합니다.

  새 OS, 아키텍처, 컴파일러/STL 구현, 플랫폼 또는 단순히 새 최상위 디렉터리에 대한 지원을 추가하는 경우,
  chrome-atls@google.com 으로 이메일을 보내 승인을 받으세요. 장기 유지보수상의 이유로,
  우리는 Chromium 프로젝트(V8 및 Skia 같은 Chromium 지원 프로젝트 포함)가 사용하는 것과,
  Chromium의 지원되는 툴체인, 아키텍처 및 플랫폼을 유지하는 데 드는 비용 증가보다 Chromium에 주는 이익이 더 큰 것만 받아들입니다
  (예: 지원되지 않는 아키텍처에 대해 ifdef 분기 하나를 추가하는 것은 비용이 무시할 만하고 괜찮을 가능성이 높지만,
  새 추상화나 상위 수준 디렉터리에 대한 변경을 도입하는 것은 비용이 높으며 Chromium에 상응하는 이익을 제공해야 합니다).
  자세한 내용은 [툴체인 지원 문서](https://chromium.googlesource.com/chromium/src/+/main/docs/toolchain_support.md)를 보세요. 지원되지 않는 구성에는 Google이 관리하는 waterfall의 bot이 없으며
  (FYI bot조차도), Chromium 개발자가 유지관리하지 않는다는 점에 유의하세요. 가능한 한 기존 ifdef 분기를 사용해 주세요.

- **코드는 여러 소비자가 이익을 얻을 때에만 중앙 위치(예: //base)로 이동되어야 합니다.**
  지나치게 일반적인 공통 라이브러리를 만들고 싶은 유혹을 참아야 합니다.
  이는 코드 비대화와 공통 코드의 불필요한 복잡성으로 이어질 수 있기 때문입니다.

- **그 코드는 우리가 지금 하려는 모든 일을 위해 설계된 것이 아닐 가능성이 높습니다.**
  새 기능이나 하위 컴포넌트가 시스템 안에 제대로 들어맞도록 기존 코드를 리팩터링할 시간을 가지세요.
  기술 부채는 쌓이기 쉽고, 이를 피하는 것은 모두의 책임입니다.

- **공통 코드는 모두의 책임입니다.**
  통합이 일어나는 많은 하위 시스템의 교차로에 있는 큰 파일들은 시스템에서 가장 취약한 부분 중 일부일 수 있습니다.
  이전 항목의 동반 원칙으로서, 작업을 완료하려고 나아갈 때 공용 영역에 더 많은 복잡성을 추가하고 있을 수 있음을 인식하세요.

- **변경에는 그에 상응하는 테스트가 포함되어야 합니다.**
  자동화된 테스트는 프로젝트로서 우리가 앞으로 나아가는 방식의 핵심입니다.
  모든 변경에는 그에 상응하는 테스트가 포함되어야 하며, 이를 통해 코드에 대한 좋은 커버리지가 있음을 보장하고
  미래의 변경이 기능을 회귀시킬 가능성을 낮출 수 있습니다. 테스트로 코드를 보호하세요!

- **[스타일가이드][cr-styleguide]에 설명된 현재 지원 언어 집합을 고수하세요.**
  특정 작업에 약간 더 나은 도구가 항상 있을 가능성은 있지만, 코드베이스의 유지보수성이 가장 중요합니다.
  언어 수를 줄이면 툴체인과 인프라 요구사항이 완화되고, 개발자가 코드베이스 전반에 성공적으로 기여하기 위해 넘어야 할 학습 장벽이 최소화됩니다.
  새 언어 추가는 [//ATL_OWNERS](https://chromium.googlesource.com/chromium/src/+/main/ATL_OWNERS)의 승인을 받아야 합니다.

- **팀이 API 변경을 하거나 서비스 간 마이그레이션을 수행할 때, 그 변경을 의무화하는 팀은 작업의 최소 80%를 수행해야 합니다.**
  그 근거는 변경을 요구하는 팀이 그 변경을 실현하는 데 필요한 시간의 대부분을 쓰게 함으로써 외부효과를 줄이는 것입니다.
  이는 자연스럽게 자동화, 툴링 또는 중앙화된 공동 전문성을 통해 변경 비용을 최소화하도록 설계하게 합니다.
  더 자세한 근거는 [이 문서](https://docs.google.com/document/d/1elJisUpOb3h4-7WA4Wn754nzfgeCJ4v2kAFvMOzNfek/edit#)
  (Google 내부)에서 찾을 수 있습니다. 예외나 도움이 필요하면 chromium-code-health-rotation@google.com 으로 연락하세요.

- **AI 코딩 어시스턴트를 사용할 때는 [Chromium AI Coding Policy](https://chromium.googlesource.com/chromium/src/+/main/agents/ai_policy.md)를 따르세요.**

## 팁

### 리뷰 에티켓

리뷰가 진행되는 동안, 병합 충돌을 최소화하기 위해 변경을 더 최신 소스 리비전에 rebase하고 싶을 수 있습니다.
이를 리뷰어에게 친절한 방식으로 하려면 먼저 해결되지 않은 코멘트를 처리하고 그 변경을 패치셋으로 업로드하세요.
그런 다음 더 최신 리비전으로 rebase하고, 그것을 (다른 변경 없이) 자체 패치셋으로 업로드하세요.
이렇게 하면 리뷰어가 코멘트에 대한 응답으로 이루어진 변경을 쉽게 볼 수 있고,
그 다음 rebase로 인한 diff를 빠르게 확인할 수 있습니다.

코드 작성자와 리뷰어는 Chromium이 글로벌 프로젝트라는 점을 염두에 두어야 합니다.
기여자와 리뷰어는 종종 서로 멀리 떨어진 시간대에 있습니다.
[시간대 간 리뷰 지연 최소화][review-lag]에 관한 이 지침을 읽고,
리뷰를 작성할 때와 리뷰 피드백에 응답할 때 모두 이를 고려해 주세요.

### Watchlists

Chromium의 한 주제나 영역을 포괄하는 파일 집합에 대한 변경 알림을 받고 싶다면,
이메일 알림을 받기 위해 [watchlists][watchlist-doc] 기능을 사용할 수 있습니다.

## 부록: CL 푸터 참조 {#cl-footer-reference}

Chromium은 커밋 메시지 하단의 푸터에 많은 정보를 저장합니다.
`R=`을 제외하고, 이러한 푸터는 커밋 메시지의 마지막 단락에서만 유효합니다.
메시지의 마지막 줄과 공백 또는 푸터가 아닌 줄로 분리된 모든 푸터는 무시됩니다.
여기에는 Gerrit 변경을 식별하는 고유한 `Change-Id`부터,
변경이 수정하는 데 도움이 되는 버그, 변경을 테스트하기 위해 실행해야 하는 trybot 등 더 유용한 메타데이터까지 모든 것이 포함됩니다.
이 섹션에는 잘 알려진 푸터, 그 의미, 형식의 목록이 포함되어 있습니다.

* **Bug:**
  * 쉼표로 구분된 버그 참조 목록입니다.
  * 버그 참조는
    * 단순 숫자일 수 있습니다. 예: `Bug: 123456`, 또는
    * 프로젝트와 숫자를 지정할 수 있습니다. 예: `Bug: skia:1234`.
  * chromium-review에서는 기본 프로젝트가 `chromium`으로 간주되므로,
    bugs.chromium.org의 non-chromium 프로젝트에 있는 모든 버그는 프로젝트 이름으로 한정해야 합니다.
  * Google 내부 이슈 트래커는 `b:` 프로젝트 접두사를 사용하여 접근할 수 있습니다.
* **Fixed:** `Bug:`와 동일하지만, CL이 랜딩될 때 버그를 fixed로 자동 종료합니다.
* **R=**
  * 이 푸터는 Chromium 프로젝트에서 _더 이상 권장되지 않습니다_; 코드 리뷰가 Gerrit로 마이그레이션될 때 deprecated되었습니다.
    대신 `git cl upload`를 실행할 때 `-r foo@example.com`을 사용하세요.
  * 리뷰어 이메일 주소의 쉼표로 구분된 목록입니다(예: foo@example.com, bar@example.com).
* **Cq-Include-Trybots:**
  * 일반 집합 외에 CQ가 트리거하고 확인해야 하는 trybot의 쉼표로 구분된 목록입니다.
  * Trybot은 `bucket:builder` 형식으로 표시됩니다(예: `luci.chromium.try:android-asan`).
  * Gerrit의 "Checks" 탭에 있는 "Choose Tryjobs" UI는 현재 선택된 tryjob에 대한 Cq-Include-Trybots 문법을 보여주며,
    이를 복사하는 버튼도 제공합니다.
* **No-Presubmit:**
  * 존재한다면 값은 항상 문자열 `true`여야 합니다.
  * CQ에게 CL에서 presubmit 검사를 실행하지 말아야 함을 나타냅니다.
  * 주로 자동화된 revert에 사용됩니다.
* **No-Try:**
  * 존재한다면 값은 항상 문자열 `true`여야 합니다.
  * CQ에게 어떤 tryjob도 시작하거나 그 결과를 확인하지 말아야 함을 나타냅니다.
  * 주로 자동화된 revert에 사용됩니다.
* **No-Tree-Checks:**
  * 존재한다면 값은 항상 문자열 `true`여야 합니다.
  * CQ에게 트리 상태를 무시하고 트리가 닫혀 있더라도 변경을 제출해야 함을 나타냅니다.
  * 주로 자동화된 revert에 사용됩니다.
* **Test:**
  * 변경에 대해 수행한 수동 테스트의 자유 형식 설명입니다.
  * 모든 테스트가 trybot으로 커버된다면 필요하지 않습니다.
* **Reviewed-by:**
  * 변경이 제출될 때 Gerrit가 자동으로 추가합니다.
  * 제출 전에 변경을 승인한(`Code-Review` 라벨을 설정한) 사람들의 이름과 이메일 주소를 나열합니다.
* **Reviewed-on:**
  * 변경이 제출될 때 Gerrit가 자동으로 추가합니다.
  * 코멘트와 패치셋 히스토리에 쉽게 접근할 수 있도록 코드 리뷰 페이지로 다시 링크합니다.
* **Change-Id:**
  * `git cl upload`가 자동으로 추가합니다.
  * Gerrit가 같은 코드 리뷰의 일부인 커밋을 추적하는 데 도움이 되는 고유 ID입니다.
* **Cr-Commit-Position:**
  * 변경이 제출될 때 git-numberer Gerrit 플러그인이 자동으로 추가합니다.
  * 이는 `fully/qualified/ref@{#123456}` 형식이며, 브랜치 이름과 그 브랜치에서의 "시퀀스 번호"를 모두 제공합니다.
  * 이는 SVN 스타일의 단조 증가 리비전 번호에 가깝습니다.
* **Cr-Branched-From:**
  * main이 아닌 브랜치에 제출되는 변경에서 git-numberer Gerrit 플러그인이 자동으로 추가합니다.
  * main이 아닌 브랜치 히스토리를 읽는 사람이 주어진 커밋이 언제 main에서 갈라졌는지 찾는 데 도움을 줍니다.

[//]: # (참조 링크 섹션은 알파벳순으로 정렬되어야 합니다)
[becoming-a-committer]: https://www.chromium.org/getting-involved/become-a-committer/
[checkout-and-build]: https://chromium.googlesource.com/chromium/src/+/main/docs/#checking-out-and-building
[chrome-dd-review-process]: http://go/chrome-dd-review-process
[chromium-design-docs]: https://groups.google.com/a/chromium.org/forum/#!forum/chromium-design-docs
[code-reviews-owners]: code_reviews.md#OWNERS-files
[code-reviews]: code_reviews.md
[commit-checklist]: commit_checklist.md
[commit-queue]: infra/cq.md
[core-principles]: https://www.chromium.org/developers/core-principles
[corporate-cla]: https://cla.developers.google.com/about/google-corporate?csw=1
[cr-authors]: https://chromium.googlesource.com/chromium/src/+/HEAD/AUTHORS
[cr-styleguide]: https://chromium.googlesource.com/chromium/src/+/main/styleguide/styleguide.md
[crbug-new]: https://bugs.chromium.org/p/chromium/issues/entry
[crbug]: https://bugs.chromium.org/p/chromium/issues/list
[cros-authors]: https://chromium.googlesource.com/chromium/src/+/main/AUTHORS
[cros-dev-guide]: https://chromium.googlesource.com/chromiumos/docs/+/main/developer_guide.md
[crrev]: https://chromium-review.googlesource.com
[depot-tools-setup]: https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up
[design-doc-template]: https://docs.google.com/document/d/14YBYKgk-uSfjfwpKFlp_omgUq5hwMVazy_M965s_1KA
[direct-commit]: https://dev.chromium.org/developers/contributing-code/direct-commit
[discussion-groups]: https://www.chromium.org/developers/discussion-groups
[github-tutorial]: https://try.github.io
[good-git-commit-message]: https://chris.beams.io/posts/git-commit/
[individual-cla]: https://cla.developers.google.com/about/google-individual?csw=1
[issue-461824120]: https://issues.chromium.org/issues/461824120
[life-of-a-chromium-developer]: https://docs.google.com/presentation/d/1abnqM9j6zFodPHA38JG1061rG2iGj_GABxEDgZsdbJg/edit
[noms-tutorial]: https://meowni.ca/posts/chromium-101
[review-lag]: https://dev.chromium.org/developers/contributing-code/minimizing-review-lag-across-time-zones
[skia-dev-guide]: https://skia.org/docs/dev/contrib/
[try-job-access]: https://www.chromium.org/getting-involved/become-a-committer#TOC-Try-job-access
[v8-dev-guide]: https://v8.dev/docs
[watchlist-doc]: infra/watchlists.md

원문: https://raw.githubusercontent.com/chromium/chromium/main/docs/contributing.md

## History

- 2026-07-06: raw_url 원문 전체를 한국어로 번역하여 노트 생성.
