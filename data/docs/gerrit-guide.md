---
title: Gerrit 가이드
order: 27
group: 번역 · docs
description: Gerrit 계정 설정과 사용법
source_path: docs/gerrit_guide.md
source_sha256: ffec1bb223d95fe43438bccfddc91a75fa5b0afbb112d642a5ec7c966fd2eb61
translation_status: full
---
> 이 문서는 **Gerrit Guide**([`docs/gerrit_guide.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/gerrit_guide.md)) 문서의 한국어 전체 번역입니다.

## 소개

### (모든 사용자) Chromium Gerrit 인스턴스 접근 권한 얻기

1. [depot_tools](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html#_setting_up)를 설치한다.

2. https://chromium-review.googlesource.com/ 에 방문하여 한 번 로그인해서 Gerrit에 계정을 설정한다. 이렇게 하면 CL을 업로드하는 데 필요한 계정이 있는지 확인된다.

3. https://chromium-review.googlesource.com/#/settings/ 에 방문하여 "Full Name" 필드를 확인해서 Gerrit에 실제 이름을 설정한다.

4. Git이 올바르게 설정되어 있는지 확인한다:

        # 이름과 이메일을 반드시 설정한다
        git config --global user.name "CHANGE ME"
        git config --global user.email CHANGE_ME@chromium.org
        git config --global depot-tools.useNewAuthStack 1
        update_depot_tools
        git cl creds-check --global

5. @google.com 계정 또는 연결된 @chromium.org 계정을 사용 중이라면:

    1. 계정을 인증하기 위해 하루에 한 번 `gcert`를 실행한다.

6. 그렇지 않다면,

    1. 로그인하려면 `git credential-luci login`을 실행한다.

    2. **커미터:** 보안 키로 재인증하려면 하루에 한 번 `git credential-luci reauth`를 실행한다. SSH 또는 원격 데스크톱을 통해 ReAuth를 완료하려면 지침은 [Gerrit ReAuth Guide](https://chromium.googlesource.com/chromium/src/+/main/docs/gerrit_reauth.md)를 참고한다.

### (모든 사용자) 확인

`git ls-remote https://chromium.googlesource.com/chromiumos/manifest.git`를 실행한다.

이 명령은 어떤 자격 증명도 요청해서는 **안 되며**, git 참조 목록만 출력해야 한다.

### (Googler) @chromium.org 및 @google.com 계정 연결

@chromium.org 계정과 @google.com 계정을 둘 다 가지고 있다면, 두 계정을 연결하고 싶을 수 있다.

그렇게 하면 모든 CL을 한 번에 더 쉽게 볼 수 있고, 잘못된 계정으로 CL을 업로드할 가능성이 낮아질 수 있다.

하지만 계정을 연결하기로 선택하면 @google.com 계정만 사용하여 로그인하라는 메시지가 표시되며, 이는 @google.com 계정에 적용되는 모든 보안 제한을 따라야 한다는 뜻이다.

**주의**: 계정을 연결해도 이미 업로드한 CL의 소유권은 변경되지 않으며, 보조(@google.com) 계정이 소유한 모든 CL에 대한 **편집 접근 권한을 잃게 된다**. 즉, 연결 전에 @google.com 계정으로 업로드한 CL은 @chromium.org 대시보드에 표시되지 않는다. 진행 중인 변경사항은 다시 업로드해야 하므로, 중요한 진행 중 변경사항이 있다면 계정 연결을 권장하지 않는다.

**계정을 연결하려면:**

두 이메일 계정(@chromium.org 및 @google.com)이 있지만 **Gerrit 계정은 하나만 있는** 경우 직접 연결할 수 있다:

1. @chromium.org 계정을 사용하여 https://chromium-review.googlesource.com 에 로그인한다.
2. [Settings -> Email Addresses](https://chromium-review.googlesource.com/#/settings/EmailAddresses)로 이동한다.
3. "New email address" 필드에 @google.com 계정을 입력하고, Send Verification 버튼을 클릭한 뒤 지침을 따른다.
4. 제대로 동작했는지 확인하려면 [Settings -> Identities](https://chromium-review.googlesource.com/#/settings/web-identities)를 열고 @chromium.org, @google.com 및 ldapuser/* ID가 나열되어 있는지 확인한다.
5. https://chrome-internal-review.googlesource.com 에서 1-4를 반복하되, 로그인에는 @google.com 이메일을 사용하고 "Register new email" 대화상자에는 @chromium.org를 사용한다.

오류가 발생하면 [티켓을 제출한다](https://issues.chromium.org/issues/new?component=1456263&template=1923295).

**Gerrit 계정이 두 개 있는 경우** 계정을 연결하려면 관리자가 필요하다. go/fix-chrome-git을 사용하여 티켓을 제출한다.

계정이 연결되면 git 커밋에서 @chromium.org 및 @google.com 이메일을 모두 사용할 수 있다. 이는 전역 git 설정에 @chromium.org 이메일이 있고, chrome-internal trybot을 트리거하려고 할 때 특히 유용하다(그 trybot들은 그렇지 않으면 @google.com 이메일을 요구한다).

계정을 연결한 상태에서 연결을 해제하고 싶다면:

* chromium-review에서 https://chromium-review.googlesource.com/settings/#EmailAddresses 로 이동하여, 더 이상 사용하고 싶지 않은 계정과 연결된 모든 주소(예: 모든 @google 주소)에서 "Delete"를 클릭한 다음, 사용하고 싶은 계정(예: @chromium 계정)으로 다시 로그인한다.
* chrome-internal-review에서 https://chrome-internal-review.googlesource.com/settings/#EmailAddresses 로 이동하여 동일하게 수행한다(아마 @chromium을 삭제한 다음 @google 계정으로 로그인하게 될 것이다).

오류가 발생하면 [티켓을 제출한다](https://issues.chromium.org/issues/new?component=1456263&template=1923295).

## 흔한 문제

### email address blah@chromium.org is not registered in your account, and you lack 'forge committer' permission

이는 CL을 업로드하는 데 사용하는 이메일이 Git 커밋을 만드는 데 사용하는 이메일과 같지 않다는 뜻이다.

이 문제를 해결하려면 Git에 설정된 이메일이 올바른지 확인한다:

    git config --global user.email CHANGE_ME@chromium.org

Gerrit 인증을 고치려면 다음을 실행한다:

    git cl creds-check

`git cl upload`를 사용하지 않거나 `--no-squash`와 함께 사용하는 경우, 올바른 이메일로 커밋을 다시 작성해야 할 수 있다:

    git rebase -f

### SSOAuthenticator: Timeout

이 오류가 발생하고 Windows에 SSH로 접속 중이라면, 대신 Chrome Remote Desktop을 사용해 본다. (SSH는 접속하는 위치에 따라 더 많은 지연 시간을 유발한다.)

### 이메일을 받지 못하고 있나요?

Gerrit에서 이메일을 받아야 한다고 생각하지만 받은편지함에 보이지 않는 경우, 스팸 폴더를 반드시 확인한다. 메일 리더가 Gerrit에서 온 이메일을 스팸으로 잘못 분류하고 있을 수 있다.

### 아직 문제가 있나요?

단서가 있는지 확인하려면 [Gerrit Documentation](https://gerrit-review.googlesource.com/Documentation/index.html)을 살펴본다.

문제가 있으면 **Chromium** 이슈 트래커에 [Build Infrastructure 이슈를 연다](https://bugs.chromium.org/p/chromium/issues/entry?template=Build+Infrastructure)("Build Infrastructure" 템플릿이 자동으로 선택되어야 한다).

## 팁

### 프로젝트 감시 / 알림

[Settings -> Notifications](https://chromium-review.googlesource.com/settings/#Notifications)에서 Project를 추가하여 변경사항을 "감시"하고 싶은 프로젝트(및 브랜치)를 선택할 수 있다.

### 진행 중인 다른 Gerrit 리뷰 위에 어떻게 빌드하나요?

시나리오: 이슈 번호가 123456인 진행 중 Gerrit 리뷰가 있다(이는 Gerrit 리뷰 URL에서 마지막 / 뒤의 숫자다). 로컬 브랜치가 있고, 변경사항은 예를 들어 2a40ae라고 하자.

다른 사람이 이슈 번호 456789인 진행 중 Gerrit 리뷰를 가지고 있다. 그 위에 빌드하고 싶다. 이를 수행하는 한 가지 방법은 다음과 같다:

```
git checkout -b their_branch

git cl patch -f 456789

git checkout -b my_branch # yes, create a new

git cherry-pick 2a40ae # your change from local branch

git branch --set-upstream-to=their_branch

git rebase

git cl issue 123456

<any more changes to your commit(s)>

git cl upload
```

원문 링크: https://raw.githubusercontent.com/chromium/chromium/main/docs/gerrit_guide.md

## History

- 2026-07-06: Chromium `docs/gerrit_guide.md` 원문 전체를 한국어로 번역하여 노트로 저장함.
