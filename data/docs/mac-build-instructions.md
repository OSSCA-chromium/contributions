---
title: Mac 빌드 안내
order: 28
group: 번역 · docs
description: Mac에서 체크아웃·빌드하기
source_path: docs/mac_build_instructions.md
source_sha256: 9b811cc15690efebc692652a568492c38e6f1fae157ff65544018dff323ebafd
translation_status: full
---
> 이 문서는 **Mac Build Instructions**([`docs/mac_build_instructions.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/mac_build_instructions.md)) 문서의 한국어 전체 번역입니다.

다른 플랫폼용 지침은 [코드 가져오기](https://chromium.googlesource.com/chromium/src/+/main/docs/get_the_code.md) 페이지에 링크되어 있습니다.

## Google 직원을 위한 지침

Google 직원입니까? 대신 [go/building-chrome](https://goto.google.com/building-chrome)을 보세요.


## 시스템 요구사항

*   Intel 또는 Arm Mac.
    ([Arm Mac에 대한 자세한 내용](https://chromium.googlesource.com/chromium/src.git/+/main/docs/mac_arm64.md).)
*   [Xcode](https://developer.apple.com/xcode/). Xcode에는 다음이 포함되어 있습니다...
*   macOS SDK. 다음을 실행하세요.

    ```shell
    $ ls `xcode-select -p`/Platforms/MacOSX.platform/Developer/SDKs
    ```

    이를 통해 SDK가 있는지, 그리고 어떤 버전이 있는지 확인합니다.
    [mac_sdk.gni](https://chromium.googlesource.com/chromium/src/+/main/build/config/mac/mac_sdk.gni)의 `mac_sdk_official_version`은 모든 봇과
    [공식 빌드](https://source.chromium.org/search?q=MAC_BINARIES_LABEL&ss=chromium)에 사용되는 SDK 버전이므로,
    해당 버전은 동작이 보장됩니다. 더 새로운 SDK로 빌드하는 것도 보통 동작합니다
    (동작하지 않으면 수정하거나 버그를 제출해 주세요).

    더 오래된 SDK로 빌드하는 것도 동작할 수 있지만, 동작하지 않는 경우 이를 동작하게 만들기 위한 변경은
    받아들이지 않습니다.

    최신 SDK를 얻는 가장 쉬운 방법은 최신 버전의 Xcode를 사용하는 것이며,
    이는 종종 최신 버전의 macOS 사용을 요구합니다. Xcode 자체는 많이 사용하지 않으므로,
    무엇을 하고 있는지 알고 있다면 더 오래된 macOS 버전에서도 새 버전의 macOS SDK를 설치하기만 하면
    빌드를 동작하게 만들 수 있을 가능성이 큽니다.
*   APFS로 포맷된 볼륨(이는 macOS 볼륨의 기본 형식입니다).

## `depot_tools` 설치

`depot_tools` 저장소를 클론합니다.

```shell
$ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```

`depot_tools`를 PATH 끝에 추가합니다(아마도 이를 `~/.bash_profile` 또는 `~/.zshrc`에 넣고 싶을 것입니다).
`depot_tools`를 `/path/to/depot_tools`에 클론했다고 가정합니다(참고: **반드시** 절대 경로를 사용해야 합니다.
그렇지 않으면 Python이 infra 도구를 찾을 수 없습니다).

```shell
$ export PATH="$PATH:/path/to/depot_tools"
```

## 코드 가져오기

체크아웃을 위한 `chromium` 디렉터리를 만들고 그 안으로 이동합니다(전체 경로에 공백이 없기만 하면,
원하는 어떤 이름을 붙여도 되고 어디에 두어도 됩니다).

```shell
$ mkdir chromium && cd chromium
```

코드와 그 의존성을 체크아웃하기 위해 `depot_tools`의 `fetch` 도구를 실행합니다.

```shell
$ caffeinate fetch chromium
```

`caffeinate`와 함께 `fetch`를 실행하는 것은 선택 사항이지만, 상당한 시간이 걸릴 수 있는 `fetch` 명령 동안
시스템이 잠자기 상태가 되는 것을 방지합니다.

전체 저장소 히스토리가 필요하지 않다면 `fetch --no-history chromium`을 사용해 시간을 절약할 수 있습니다.
나중에 전체 히스토리를 가져오려면 `git fetch --unshallow`를 호출할 수 있습니다.

`fetch`에 `--git-cache`를 전달하면 이를 훨씬 더 빠르게 만들 수 있습니다. 이 옵션은 처음부터 클론하는 대신
공유된 사전 빌드 스냅샷으로 체크아웃을 시드합니다(그리고 `--no-history`와 달리 전체 히스토리를 유지합니다).

```shell
$ fetch --git-cache chromium
```

캐시 디렉터리는 자동으로 선택됩니다(`$GIT_CACHE_PATH`로 재정의 가능). 이 디렉터리는 가져오는 모든 저장소를
미러링하며(Chromium의 경우 약 30GB), 해당 머신의 모든 체크아웃이 공유합니다. 작업 트리는 객체를 복사하는 대신
이를 참조하므로 체크아웃별 `.git`은 작게 유지됩니다.

빠른 연결에서도 명령이 30분 정도 걸릴 수 있으며, 느린 연결에서는 여러 시간이 걸릴 수 있습니다.

`fetch`가 완료되면 작업 디렉터리에 숨김 `.gclient` 파일과 `src`라는 디렉터리가 만들어져 있을 것입니다.
나머지 지침은 `src` 디렉터리로 이동했다고 가정합니다.

```shell
$ cd src
```

*선택 사항*: 빌드가 일부 Google 서비스와 통신하기를 원한다면 [API 키 설치](https://www.chromium.org/developers/how-tos/api-keys)도 할 수 있습니다.
하지만 대부분의 개발 및 테스트 목적에는 필요하지 않습니다.

## 빌드 설정

Chromium은 `.ninja` 파일 생성을 위해 [GN](https://gn.googlesource.com/gn/+/main/docs/quick_start.md)이라는 도구와 함께
[Ninja](https://ninja-build.org)를 주 빌드 도구로 사용합니다. 서로 다른 구성의 *빌드 디렉터리*를 원하는 만큼 만들 수 있습니다.
빌드 디렉터리를 만들려면 다음을 실행합니다.

```shell
$ gn gen out/Default
```

* 새 빌드 디렉터리마다 이 작업은 한 번만 실행하면 됩니다. Ninja는 필요에 따라 빌드 파일을 업데이트합니다.
* `Default`를 다른 이름으로 바꿀 수 있지만, `out`의 하위 디렉터리여야 합니다.
* 릴리스 설정을 포함한 다른 빌드 인수는 [GN 빌드 구성](https://www.chromium.org/developers/gn-build-configuration)을 보세요.
  기본값은 현재 호스트 운영체제 및 CPU와 일치하는 디버그 컴포넌트 빌드입니다.
* GN에 대한 자세한 정보는 명령줄에서 `gn help`를 실행하거나
  [빠른 시작 가이드](https://gn.googlesource.com/gn/+/main/docs/quick_start.md)를 읽으세요.
* Arm Mac용 Chromium 빌드에는 [추가 설정](https://chromium.googlesource.com/chromium/src/+/main/docs/mac_arm64.md)이 필요합니다.


### 더 빠른 빌드

전체 재빌드는 Debug와 Release에서 속도가 거의 같지만, Release 빌드에서는 링크가 훨씬 빠릅니다.

릴리스 빌드를 하려면 `args.gn`에 다음을 넣으세요.

```
is_debug = false
```

하나의 큰 실행 파일 대신 많은 작은 dylib를 빌드하려면 `args.gn`에 다음을 넣으세요.

```
is_component_build = true
```

이렇게 하면 생성되는 바이너리가 덜 빠르게 열리는 대가로 증분 빌드가 훨씬 빨라집니다. 컴포넌트 빌드는 debug와 release 모두에서 동작합니다.

디버그 심볼을 완전히 비활성화하려면 args.gn에 다음을 넣으세요.

```
symbol_level = 0
```

이렇게 하면 전체 재빌드와 링크가 모두 빨라집니다(gdb에서 심볼화된 백트레이스를 얻지 못하는 대가가 있습니다).

LLVM의 LLD 대신 Apple의 링커(ld-prime)를 사용하려면 `args.gn`에 다음을 넣으세요.

```
use_lld = false
```

이는 로컬 비크로스 arm64 macOS 빌드(ARM Mac)에서 지원되며 링크 속도를 향상시킵니다. 자세한 내용은
[macOS 및 iOS 빌드용 링커](https://chromium.googlesource.com/chromium/src/+/main/docs/apple_platform_linkers.md)를 보세요.

#### Reclient 사용

또한 Google 직원은 분산 컴파일 시스템인 Reclient를 사용해야 합니다. 자세한 정보는 내부적으로 제공되지만,
관련 gn 인수는 다음과 같습니다.
* `use_remoteexec = true`

Google 직원은 자세한 정보를 위해
[go/building-chrome-mac#using-remote-execution](https://goto.google.com/building-chrome-mac#using-remote-execution)을 방문할 수 있습니다.
외부 기여자의 경우 Reclient는 Mac 빌드를 지원하지 않습니다.

#### CCache

빌드 속도를 높이기 위해 [ccache 설치](https://chromium.googlesource.com/chromium/src/+/main/docs/ccache_mac.md)도 원할 수 있습니다.

## Chromium 빌드

다음 명령을 사용해 Ninja로 Chromium("chrome" 대상)을 빌드합니다.

```shell
$ autoninja -C out/Default chrome
```

(`autoninja`는 `ninja`에 전달되는 인수에 대해 최적 값을 자동으로 제공하는 래퍼입니다.)

명령줄에서 `gn ls out/Default`를 실행하면 GN으로부터 다른 모든 빌드 대상의 목록을 얻을 수 있습니다.
하나를 컴파일하려면 앞의 "//" 없이 GN 라벨을 Ninja에 전달합니다(따라서 `//chrome/test:unit_tests`의 경우
`autoninja -C out/Default chrome/test:unit_tests`를 사용합니다).

[Siso 팁](https://chromium.googlesource.com/chromium/src/+/main/siso_tips.md)도 보세요.

## Chromium 실행

빌드가 완료되면 브라우저를 간단히 실행할 수 있습니다.

```shell
$ out/Default/Chromium.app/Contents/MacOS/Chromium
```

## 각 빌드 후 시스템 권한 대화상자 피하기

새 개발자 빌드를 시작할 때마다 다음 두 개의 시스템 대화상자가 표시될 수 있습니다.
`Chromium wants to use your confidential information stored in "Chromium Safe
Storage" in your keychain.`, 그리고 `Do you want the application "Chromium.app" to
accept incoming network connections?`.

이를 피하려면 다음 명령줄 플래그로 Chromium을 실행할 수 있습니다(물론 이 플래그들이 특정 하위 시스템의 동작을 변경한다는 점에 주의하세요).

```shell
--use-mock-keychain --disable-features=DialMediaRouteProvider
```

## 테스트 대상 빌드 및 실행

테스트는 유형과 디렉터리 구조 내 위치에 따라 여러 테스트 대상으로 나뉩니다. 특정 단위 테스트 또는 브라우저 테스트 파일이
어떤 대상에 해당하는지 보려면 다음 명령을 사용할 수 있습니다.

```shell
$ gn refs out/Default --testonly=true --type=executable --all chrome/browser/ui/browser_unittest.cc
//chrome/test:unit_tests
```

위 예에서 대상은 unit_tests입니다. unit_tests 바이너리는 다음 명령을 실행해 빌드할 수 있습니다.

```shell
$ autoninja -C out/Default unit_tests
```

unit_tests 바이너리를 실행해 테스트를 실행할 수 있습니다. `--gtest_filter` 인수를 사용해 실행할 테스트를 제한할 수도 있습니다. 예:

```shell
$ out/Default/unit_tests --gtest_filter="BrowserListUnitTest.*"
```

GoogleTest에 대해서는 [GitHub 페이지](https://github.com/google/googletest)에서 더 알아볼 수 있습니다.

## 디버깅

좋은 디버깅 팁은 [여기](https://chromium.googlesource.com/chromium/src/+/main/docs/mac/debugging.md)에서 찾을 수 있습니다.

## 체크아웃 업데이트

기존 체크아웃을 업데이트하려면 다음을 실행할 수 있습니다.

```shell
$ git rebase-update
$ gclient sync
```

첫 번째 명령은 기본 Chromium 소스 저장소를 업데이트하고, 로컬 브랜치가 있다면 tip-of-tree(일명 Git 브랜치 `origin/main`) 위에 리베이스합니다.
이 스크립트를 사용하고 싶지 않다면, 저장소 업데이트를 위해 그냥 `git pull` 또는 다른 일반적인 Git 명령을 사용할 수도 있습니다.

두 번째 명령은 의존성을 적절한 버전으로 동기화하고 필요에 따라 훅을 다시 실행합니다.

## 팁, 트릭 및 문제 해결

### Xcode-Ninja 하이브리드 사용

Xcode 사용은 지원되지 않지만, GN은 빌드에는 Ninja를 사용하고 편집 및 컴파일 구동에는 Xcode를 사용하는 하이브리드 접근 방식을 지원합니다.
Xcode는 여전히 느리지만, **인덱싱이 활성화되어 있어도** 꽤 잘 실행됩니다. 다만 대부분의 사람들은 터미널에서 빌드하고 텍스트 편집기로 코드를 작성합니다.

하이브리드 빌드에서도 컴파일은 여전히 Ninja가 처리하며, 명령줄에서 실행할 수 있습니다(예: `autoninja -C out/gn chrome`).
또는 하이브리드 프로젝트에서 `chrome` 대상을 선택하고 Build를 선택해 실행할 수 있습니다.

Xcode-Ninja 하이브리드를 사용하려면 `gn gen`에 `--ide=xcode`를 전달합니다.

```shell
$ gn gen out/gn --ide=xcode
```

엽니다.

```shell
$ open out/gn/all.xcodeproj
```

Chrome을 실행할 때마다 http://YES 가 새 탭으로 열리는 문제가 발생할 수 있습니다. 이를 수정하려면 Run 스킴의 스킴 편집기를 열고,
Options 탭을 선택한 다음, "Allow debugging when using document Versions Browser"의 체크를 해제합니다. 이 옵션이 체크되어 있으면
Xcode가 실행 인수에 `--NSDocumentRevisionsDebugMode YES`를 추가하고, `YES`가 열어야 할 URL로 해석됩니다.

빌드에 문제가 있다면 `irc.freenode.net`의 `#chromium`에 참여해 질문하세요. 체크아웃하기 전에
[waterfall](https://build.chromium.org/buildbot/waterfall/)이 초록색이고 트리가 열려 있는지 확인하세요. 이렇게 하면 성공 가능성이 높아집니다.

### git 명령의 성능 향상

#### vnode 캐시 크기 늘리기

`git status`는 체크아웃의 상태를 확인하기 위해 자주 사용됩니다. Chromium 체크아웃에 있는 파일 수가 매우 많기 때문에
`git status` 성능은 상당히 들쭉날쭉할 수 있습니다. 시스템의 vnode 캐시를 늘리면 도움이 되는 것으로 보입니다. 기본적으로 이 명령은:

```shell
$ sysctl -a | egrep 'kern\..*vnodes'
```

`kern.maxvnodes: 263168`을 출력합니다(263168은 257 * 1024입니다). 이 설정을 늘리려면:

```shell
$ sudo sysctl kern.maxvnodes=$((512*1024))
```

서로 다른 Chromium 체크아웃 사이를 정기적으로 오간다면 더 높은 값이 적절할 수 있습니다. 이 설정은 재부팅하면 초기화됩니다.
시작 시 적용하려면:

```shell
$ sudo tee /Library/LaunchDaemons/kern.maxvnodes.plist > /dev/null <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
      <string>kern.maxvnodes</string>
    <key>ProgramArguments</key>
      <array>
        <string>sysctl</string>
        <string>kern.maxvnodes=524288</string>
      </array>
    <key>RunAtLoad</key>
      <true/>
  </dict>
</plist>
EOF
```

또는 파일을 직접 편집하세요.

#### 추적되지 않는 캐시를 사용하도록 git 구성

다음을 실행해 보세요.

```shell
$ git update-index --test-untracked-cache
```

출력이 `OK`로 끝나면, 다음도 `git status`의 성능을 향상시킬 수 있습니다.

```shell
$ git config core.untrackedCache true
```

#### fsmonitor를 사용하도록 git 구성

[fsmonitor.](https://github.blog/2022-06-29-improve-git-monorepo-performance-with-a-file-system-monitor/)를 사용하면 git 속도를 크게 높일 수 있습니다.
Chromium 및 v8 같은 큰 저장소에서는 fsmonitor를 활성화해야 합니다. 전역으로 활성화하면 많은 프로세스가 시작되며 아마도 그럴 가치가 없을 것입니다.
최소한 버전 2.43 이상을 사용하고 있는지 확인하세요(그 이전 버전에서는 Mac의 fsmonitor가 고장나 있습니다). 현재 저장소에서 fsmonitor를 활성화하는 명령은 다음과 같습니다.

```shell
$ git config core.fsmonitor true
```

### Xcode 라이선스 동의

다음 오류가 표시된다면

> Agreeing to the Xcode/iOS license requires admin privileges, please re-run as
> root via sudo.

Xcode 라이선스가 아직 수락되지 않은 것입니다. (메시지와 달리) 어떤 사용자든 다음을 실행해 수락할 수 있습니다.

```shell
$ xcodebuild -license
```

해당 머신의 모든 사용자에 대해 수락하는 경우에만 root가 필요합니다.

```shell
$ sudo xcodebuild -license
```

### Spotlight 인덱싱에서 체크아웃 제외

Chromium 체크아웃에는 많은 파일이 포함되어 있으며, 빌드는 훨씬 더 많은 파일을 생성합니다. Spotlight는 이러한 모든 파일을 인덱싱하려고 하며,
특히 빌드 중에는 많은 CPU 시간을 사용하므로 작업이 느려질 수 있습니다.

Chromium 체크아웃이 Spotlight에 의해 인덱싱되지 않게 하려면 System Preferences를 열고 "Spotlight" -> "Privacy"로 이동한 다음,
Chromium 체크아웃 디렉터리를 제외된 위치 목록에 추가하세요.

원문 링크: https://raw.githubusercontent.com/chromium/chromium/main/docs/mac_build_instructions.md

## History

- 2026-07-07: Chromium `docs/mac_build_instructions.md` 원문 전체를 한국어로 번역해 저장.
