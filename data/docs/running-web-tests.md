---
title: 웹 테스트 실행과 디버깅
order: 37
group: 번역 · docs/testing
description: 웹 테스트 실행과 디버깅 방법
source_path: docs/testing/web_tests.md
source_sha256: 4446034c0b2df0869a0d4a4cd48b708fbf5ca59b4011789db58dc0577c173fa9
translation_status: full
---
> 이 문서는 **Running and Debugging Web Tests**([`docs/testing/web_tests.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md)) 문서의 한국어 전체 번역입니다.

웹 테스트는 Blink에서 레이아웃과 렌더링을 포함하되 이에 국한되지 않는 여러 컴포넌트를 테스트하는 데 사용된다. 일반적으로 웹 테스트는 테스트 렌더러(`content_shell`)에서 페이지를 로드하고 렌더링된 출력 또는 JavaScript 출력을 기대 출력 파일과 비교하는 방식으로 이루어진다.

이 문서는 기존 웹 테스트를 실행하고 디버깅하는 방법을 다룬다. 웹 테스트를 작성해야 하는 상황이라면 [Writing Web Tests 문서](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/writing_web_tests.md)를 참고하라.

"layout tests"라는 용어를 "web tests"로 변경했다는 점에 유의하라. 이 용어들은 같은 것을 의미한다고 보면 된다. 또한 이를 "WebKit tests" 및 "WebKit layout tests"라고도 부른다.

["Web platform tests"](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_platform_tests.md)(WPT)는 권장되는 웹 테스트 형식이며 [web_tests/external/wpt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt)에 위치한다. 브라우저 간에 동작해야 하는 테스트는 그곳에 둔다. 다른 디렉터리는 Chrome 전용 테스트만을 위한 것이다.

참고: Web Platform Test에 대한 가이드를 찾고 있다면 ["Web platform tests"](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_platform_tests.md)(WPT)를 읽어야 한다. 이 문서는 WPT 고유 기능/동작을 다루지 않는다.

참고: Chrome, Chrome Android 또는 WebView로 Web Platform Tests를 실행하는 가이드를 찾고 있다면 ["Running Web Platform Tests with run_wpt_tests.py"](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/run_web_platform_tests.md)를 읽어야 한다.


## 웹 테스트 실행하기

### 지원 플랫폼

* Linux
* MacOS
* Windows
* Fuchsia

Android는 [지원되지 않는다](https://crbug.com/567947).

### 초기 설정

웹 테스트를 실행하려면 먼저 `blink_tests` 타깃을 빌드하여 `content_shell` 및 필요한 다른 모든 바이너리를 얻어야 한다.

```bash
autoninja -C out/Default blink_tests
```

**Mac**에서는 테스트를 시작하기 전에 content_shell 바이너리에서 심볼을 제거(strip)하는 것이 좋다. 그렇게 하지 않으면 5~10개의 프로세스가 동시에 실행되면서 모두 OS 크래시 리포터의 검사를 받느라 멈춰 있을 수 있다. 이로 인해 일반적으로는 발생하지 않는 타임아웃 같은 다른 실패가 발생할 수 있다.

```bash
strip ./out/Default/Content\ Shell.app/Contents/MacOS/Content\ Shell
```

### 테스트 실행하기

테스트 러너 스크립트는 `third_party/blink/tools/run_web_tests.py`에 있다.

사용할 빌드 디렉터리(예: out/Default 등)를 지정하려면 `-t` 또는 `--target` 매개변수를 전달해야 한다. 디렉터리를 지정하지 않으면 `out/Release`가 사용된다. 내장된 `out/Default`를 사용하려면 다음을 사용한다.

```bash
third_party/blink/tools/run_web_tests.py -t Default
```

*** promo
* Windows 사용자는 대신 `third_party\blink\tools\run_web_tests.bat`를 사용해야 한다.
* Linux 사용자는 `testing/xvfb.py`를 사용해서는 안 된다. `run_web_tests.py`가 Xvfb 자체를 관리한다.
***

[TestExpectations](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/TestExpectations)에서 `[ Skip ]`으로 표시된 테스트는 기본적으로 실행되지 않는다. 일반적으로 다루기 어려운 도구 오류를 일으키기 때문이다. 그중 하나를 강제로 실행하려면 해당 파일 이름을 바꾸거나, 건너뛴 테스트를 명령줄(아래 참조)에 지정하거나, --test-list로 지정한 파일에 넣으면 된다(단, --skip=always는 `[ Skip ]`으로 표시된 테스트를 항상 건너뛰게 만들 수 있다). TestExpectations 및 관련 파일에 대해 자세히 알아보려면 [Web Test Expectations 문서](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_expectations.md)를 읽어라.

*** promo
현재 Fuchsia 봇에서는 [Default.txt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/TestLists/Default.txt)에 나열된 테스트만 실행된다. 모든 웹 테스트를 실행하는 데 Fuchshia에서 시간이 너무 오래 걸리기 때문이다. 대부분의 개발자는 Blink 테스트를 Linux에 집중한다. 우리는 스모크 테스트가 다루는 시나리오를 벗어난 경우 Linux와 Fuchsia의 동작이 거의 동일하다는 사실에 의존한다.
***

*** promo
Fuchsia의 경우와 유사하게, 오래된 mac 버전 봇에서는 [MacOld.txt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/TestLists/MacOld.txt)에 나열된 테스트가 실행된다. 이렇게 함으로써 테스트 실행에 필요한 리소스를 줄였다. 이는 대부분의 웹 테스트가 서로 다른 mac 버전에서도 유사하게 동작한다는 사실에 의존한다.
***

일부 테스트만 실행하려면 웹 테스트 디렉터리(`src/third_party/blink/web_tests`)를 기준으로 한 디렉터리나 파일 이름을 `run_web_tests.py`의 인수로 지정한다. 예를 들어 fast form 테스트를 실행하려면 다음을 사용한다.

```bash
third_party/blink/tools/run_web_tests.py fast/forms
```

또는 다음 단축형을 사용할 수도 있다.

```bash
third_party/blink/tools/run_web_tests.py fast/fo\*
```

*** promo
예: `content_shell`의 디버그 빌드로 웹 테스트를 실행하되 SVG 테스트만 테스트하고 픽셀 테스트를 실행하려면 다음을 실행한다.

```bash
third_party/blink/tools/run_web_tests.py -t Default svg
```
***

마지막으로 빠르지만 덜 견고한 대안으로, content_shell 실행 파일을 직접 사용하여 특정 테스트를 실행할 수도 있다(Windows 예시).

```bash
out\Default\content_shell.exe --run-web-tests <url>|<full_test_source_path>|<relative_test_path>
```

예:

```bash
out\Default\content_shell.exe --run-web-tests \
    c:\chrome\src\third_party\blink\web_tests\fast\forms\001.html
```
또는

```bash
out\Default\content_shell.exe --run-web-tests fast\forms\001.html
```

하지만 이 방법은 셸이 대신 해주지 않기 때문에 기대 결과와 수동으로 diff를 비교해야 한다. 또한 텍스트 결과만 덤프한다(픽셀 및 오디오 바이너리 데이터의 덤프는 사람이 읽을 수 없기 때문이다). `content_shell` 실행에 대한 자세한 내용은 [Running Web Tests Using the Content Shell](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_in_content_shell.md)을 참고하라.

지원되는 인수의 전체 목록을 보려면 다음을 실행한다.

```bash
third_party/blink/tools/run_web_tests.py --help
```

*** note
**Linux 참고:** 우리는 글꼴 메트릭과 위젯 메트릭을 맞춰 Windows 렌더 트리 출력과 정확히 일치시키려고 한다. 렌더 트리 출력에 차이가 있다면, 글꼴 메트릭을 개선하여 리베이스라인을 피할 수 있는지 확인해야 한다. Linux 웹 테스트에 대한 추가 정보는 [docs/web_tests_linux.md](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_linux.md)를 참고하라.
***

*** note
**Mac 참고:** 테스트가 실행되는 동안 올바른 종류의 스크롤바, 색상 등이 사용되도록 여러 Appearance 설정이 자동으로 덮어써진다. 픽셀 테스트에서 기대하는 것과 ColorSync의 색상 보정이 일치하도록 기본 디스플레이의 "Color Profile"도 변경된다. 이 변경은 눈에 띄며, 그 정도는 디스플레이의 일반적인 보정 수준에 따라 달라진다. 테스트는 완료 시 설정을 복원하기 위해 최선을 다하지만, 잘못된 상태로 남아 있다면 System Preferences → Displays → Color로 이동해 "올바른" 값을 선택하여 수동으로 재설정할 수 있다.
***

### 테스트 하니스 옵션

이 스크립트에는 많은 명령줄 플래그가 있다. 스크립트에 `--help`를 전달하면 전체 옵션 목록을 볼 수 있다. 가장 유용한 옵션 몇 가지는 다음과 같다.

| 옵션 | 의미 |
|:----------------------------|:--------------------------------------------------|
| `--debug` | 테스트 셸의 디버그 빌드를 실행한다(기본값은 릴리스). `-t Debug`와 동일하다. |
| `--nocheck-sys-deps` | 시스템 의존성을 확인하지 않는다. 더 빠른 반복 작업을 가능하게 한다. |
| `--verbose` | 통과한 테스트 목록을 포함하여 더 자세한 출력을 생성한다. |
| `--reset-results` | 현재 베이스라인(`-expected.{png`&#124;`txt`&#124;`wav}` 파일)을 실제 결과로 덮어쓰거나, 기존 베이스라인이 없으면 새 베이스라인을 만든다. |
| `--fully-parallel` | 시스템 코어 수만큼의 자식 프로세스를 사용해 테스트를 병렬로 실행한다. |
| `--driver-logging` | C++ 로그(LOG(WARNING) 등)를 출력한다. |

## 성공과 실패

테스트의 출력이 미리 정의된 기대 결과와 일치하면 테스트는 성공한다. 테스트가 하나라도 실패하면 테스트 스크립트는 실제로 생성된 결과와 실제 결과/기대 결과의 diff를 `src/out/Default/layout-test-results/`에 넣고, 기본적으로 결과/diff에 대한 요약과 링크가 있는 브라우저를 실행한다.

테스트의 기대 결과는 `src/third_party/blink/web_tests/platform` 또는 각 테스트 옆에 있다.

*** note
[testharness.js](https://github.com/w3c/testharness.js/)를 사용하는 테스트는 모든 테스트 케이스가 통과하면 기대 결과 파일을 갖지 않는다.
***

실행되지만 잘못된 출력을 생성하는 테스트는 "failed"로 표시되고, 테스트 셸을 크래시시키는 테스트는 "crashed"로 표시되며, 완료하는 데 일정 시간보다 오래 걸리는 테스트는 중단되어 "timed out"으로 표시된다. 스크립트 출력의 점 행은 하나 이상의 테스트가 통과했음을 나타낸다.

## 테스트 기대값

[TestExpectations](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/TestExpectations) 파일(및 관련 파일)은 알려진 모든 웹 테스트 실패 목록을 포함한다. 이에 대한 자세한 내용은 [Web Test Expectations 문서](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_expectations.md)를 참고하라.

## 테스트 런타임 플래그

추가 명령줄 인수로 웹 테스트를 실행하는 방법은 두 가지가 있다.

### --flag-specific

```bash
third_party/blink/tools/run_web_tests.py --flag-specific=blocking-repaint
```

이를 위해서는 `web_tests/FlagSpecificConfig`에 다음과 같은 항목이 있어야 한다.

```json
{
  "name": "blocking-repaint",
  "args": ["--blocking-repaint", "--another-flag"]
}
```

이는 테스트 하니스가 `--blocking-repaint --another-flag`를 content_shell 바이너리에 전달하도록 지시한다.

또한 이 파일이 존재한다면 `web_tests/FlagExpectations/blocking-repaint`에서 플래그별 기대값을 찾는다. 이 파일의 suppression은 기본 TestExpectations 파일을 재정의한다. 그러나 플래그별 기대값 또는 기본 기대값 중 어느 쪽에 있는 `[ Slow ]`도 항상 사용되는 기대값에 병합된다.

또한 `web_tests/flag-specific/blocking-repaint`에서 베이스라인을 찾는다. 이 디렉터리의 베이스라인은 폴백 베이스라인을 재정의한다.

*** note
[BUILD.gn](https://chromium.googlesource.com/chromium/src/+/main/BUILD.gn)은 플래그별 빌더가 항상 linux 봇에서 실행된다고 가정하므로, 플래그별 테스트 기대값과 베이스라인은 linux 봇에만 다운로드된다. 다른 플랫폼에서 플래그별 빌더를 실행해야 한다면, 해당 플랫폼으로 플래그별 관련 데이터를 다운로드하도록 BUILD.gn을 업데이트하라.
***

`--additional-driver-flag`를 사용해 content_shell에 추가 명령줄 인수를 지정할 수도 있지만, 이 경우 테스트 하니스는 플래그별 테스트 기대값이나 베이스라인을 사용하지 않는다.

### 가상 테스트 스위트

*가상 테스트 스위트*는 [web_tests/VirtualTestSuites](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/VirtualTestSuites)에 정의할 수 있으며, 추가 플래그와 함께 웹 테스트의 하위 집합을 실행하고, 경로에는 `virtual/<prefix>/...`를 사용한다. 테스트는 지정된 bases 중 하나와 경로가 일치하는 실제 기본 테스트(디렉터리 또는 파일)에 매핑되는 가상 테스트일 수도 있고, `web_tests/virtual/<prefix>/` 디렉터리 아래의 실제 테스트일 수도 있다. 예를 들어, 다음 가상 테스트 스위트를 사용해 repainting을 위한 (가상의) 새 모드를 테스트할 수 있다.

```json
{
  "prefix": "blocking_repaint",
  "platforms": ["Linux", "Mac", "Win"],
  "bases": ["compositing", "fast/repaint"],
  "args": ["--blocking-repaint"]
}
```

이는 각각 `web_tests/compositing` 및 `web_tests/fast/repaint` 아래 파일에 대응하는 `virtual/blocking_repaint/compositing/...` 및 `virtual/blocking_repaint/fast/repaint/...` 형식의 새 "가상" 테스트를 만들고, 실행될 때 `content_shell`에 `--blocking-repaint`를 전달한다.

다음 명령줄로 테스트를 실행할 수 있다는 점에 유의하라.

```bash
third_party/blink/tools/run_web_tests.py virtual/blocking_repaint/compositing \
  virtual/blocking_repaint/fast/repaint
```

이러한 가상 테스트는 원래의 `compositing/...` 및 `fast/repaint/...` 테스트에 추가로 존재한다. 이들은 `web_tests/TestExpectations`에 자체 기대값을 가질 수 있고, 자체 베이스라인도 가질 수 있다. 테스트 하니스는 비가상 기대값과 베이스라인을 폴백으로 사용한다. 가상 테스트에 자체 기대값이 있으면 모든 비가상 기대값을 재정의한다. 그렇지 않으면 비가상 기대값이 사용된다. 그러나 가상 또는 비가상 기대값 중 어느 쪽에 있는 `[ Slow ]`도 항상 사용되는 기대값에 병합된다. 가상 테스트는 통과할 것으로 기대되지만 비가상 테스트는 실패할 것으로 기대되는 경우, 가상 테스트에 대해 명시적인 `[ Pass ]` 항목을 추가해야 한다.

이렇게 하면 `web_tests/virtual/blocking_repaint` 디렉터리 아래의 실제 테스트도 `--blocking-repaint` 플래그로 실행될 수 있다.

"platforms" 설정은 일부 플랫폼에서 테스트를 건너뛰는 데 사용할 수 있다. 가상 테스트 스위트가 전체 테스트 시간의 5% 이상을 사용한다면 일부 플랫폼에서 해당 테스트 스위트를 건너뛰는 것을 고려해야 한다.

"prefix" 값은 고유해야 한다. 같은 플래그를 사용하는 여러 디렉터리는 같은 "bases" 목록에 나열해야 한다. 단지 `virtual/<prefix>` 아래의 실제 테스트를 플래그와 함께 실행하고 가상 테스트는 만들고 싶지 않은 경우, "bases" 목록은 비어 있을 수 있다.

가상 테스트 스위트는 선택적 `exclusive_tests` 필드를 가질 수 있으며, 이 필드는 이 가상 스위트 아래에서만 독점적으로 실행될 모든(`"ALL"`) 또는 일부 `bases` 테스트를 지정한다. 지정된 기본 테스트는 건너뛴다. 해당 테스트를 `exclusive_tests` 목록에 지정하지 않은 다른 가상 스위트 아래의 대응 가상 테스트도 건너뛴다. 예를 들어(관련 없는 필드는 생략):

```json
{
  "prefix": "v1",
  "bases": ["a"],
}
{
  "prefix": "v2",
  "bases": ["a/a1", "a/a2"],
  "exclusive_tests": "ALL",
}
{
  "prefix": "v3",
  "bases": ["a"],
  "exclusive_tests": ["a/a1"],
}
```

`a/a1`, `a/a2`, `a/a3` 디렉터리가 있다고 가정하면, 다음 테스트를 실행한다.

| Suite | a/a1 | a/a2 | a/a3 |
| ---------: | :-----: | :-----: | :--: |
| base | skipped | skipped | run |
| virtual/v1 | skipped | skipped | run |
| virtual/v2 | run | run | n/a |
| virtual/v3 | run | skipped | run |

### flag-specific과 가상 테스트 스위트 중 선택하기

구현이 아직 진행 중인 플래그의 경우, 플래그별 기대값과 가상 테스트 스위트는 활성화된 코드 경로와 활성화되지 않은 코드 경로를 모두 테스트하기 위한 두 가지 대안 전략을 나타낸다. 기능이 프로덕션과 실질적으로 다른 코드 경로를 갖는다면 단순히 [runtime enabled feature](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md)를 `status: "test"`로 설정하는 것보다 이 방법들이 선호된다. 후자는 프로덕션 코드 경로의 테스트 커버리지를 잃게 만들기 때문이다.

가상 테스트 스위트와 플래그별 스위트 중 선택할 때 다음을 고려하라.

* [waterfall builders](https://dev.chromium.org/developers/testing/chromium-build-infrastructure/tour-of-the-chromium-buildbot)와 [try bots](https://dev.chromium.org/developers/testing/try-server-usage)는 비가상 테스트에 더해 모든 가상 테스트 스위트를 실행한다. 반대로 플래그별 설정은 봇이 자동으로 해당 플래그를 테스트하게 만들지 않는다. 가상 테스트 스위트 없이 봇 커버리지를 원한다면 [이 지침](#running-a-new-flag_specific-suite-in-cq_ci)을 따라야 한다.

* 위의 이유로, 가상 테스트 스위트는 커밋 큐와 지속적 빌드 인프라에 성능 비용을 발생시킨다. 플래그가 변경될 때마다 `content_shell`을 재시작해야 하므로 병렬성이 제한되어 이 비용은 더 커진다. 따라서 많은 수의 가상 테스트 스위트를 추가하는 것은 피해야 한다. 가상 테스트 스위트는 기능과 직접 관련된 테스트 하위 집합을 실행하는 데 적합하지만, 모든 테스트에 잠재적으로 영향을 주는 깊은 아키텍처 변경을 만드는 플래그에는 확장성이 없다.

* 가상 테스트 경로 이름에서 와일드카드(예: `virtual/blocking_repaint/fast/repaint/*`)를 사용하는 것은 `run_web_tests.py` 명령줄에서 지원되지 않는다는 점에 유의하라. 그러나 여전히 `virtual/blocking_repaint`를 사용해 스위트의 모든 실제 및 가상 테스트를 실행하거나, `virtual/blocking_repaint/fast/repaint/dir`을 사용해 특정 디렉터리 아래 스위트의 실제 또는 가상 테스트를 실행할 수 있다.

*** note
추가 플래그와 함께 가상 테스트를 실행할 수 있다. 가상 args와 추가 플래그가 모두 적용된다. 베이스라인과 기대값의 폴백 순서는 다음과 같다. 1) 플래그별 가상, 2) 비플래그별 가상, 3) 플래그별 기본, 4) 비플래그별 기본
***

### CQ/CI에서 새 Flag-Specific 스위트 실행하기

이미 `FlagSpecificConfig` 항목을 만들었다고 가정한다.

1. `chromium.tests` swarming 풀의 용량 증가를 위해 리소스 요청([내부 문서](https://g3doc.corp.google.com/company/teams/chrome/ops/business/resources/resource-request-program.md?cl=head&polyglot=chrome-browser#i-need-new-resources))을 제출하고 승인을 기다린다.
1. `--flag-specific` 및 필요하다면 다른 특수 설정(예: 더 적은 shard)을 가진 새 전용 [Buildbot 테스트 스위트](https://source.chromium.org/chromium/chromium/src/+/main:testing/buildbot/test_suites.pyl;l=1516-1583;drc=0694b605fb77c975a065a3734bdcf3bd81fd8ca4;bpv=0;bpt=0)를 정의한다.
1. 먼저 Buildbot 스위트를 관련 `*-blink-rel` 빌더의 composition suite에 추가한다([예시](https://source.chromium.org/chromium/chromium/src/+/main:testing/buildbot/test_suites.pyl;l=5779-5780;drc=0694b605fb77c975a065a3734bdcf3bd81fd8ca4;bpv=0;bpt=0)).
1. 관련 빌더의 [`builders.json`](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/tools/blinkpy/common/config/builders.json;l=127-129;drc=ff938aaff9566b2cc442476a51835e0b90b1c6f6;bpv=0;bpt=0)에 플래그별 step 이름을 추가한다. 이제 `rebaseline-cl`과 WPT importer가 해당 스위트의 베이스라인을 생성한다.
1. 새 스위트를 리베이스라인하고 `FlagExpectations/` 아래에 필요한 suppression을 추가한다.
1. 원하는 빌더에 Buildbot 스위트를 추가하여 CQ/CI에서 플래그별 스위트를 활성화한다. 이는 [`linux-rel`](https://source.chromium.org/chromium/chromium/src/+/main:testing/buildbot/test_suites.pyl;l=5828-5829;drc=0694b605fb77c975a065a3734bdcf3bd81fd8ca4;bpv=0;bpt=0) 같은 기존 CQ 빌더일 수도 있고, 맞춤 위치 필터가 있는 [`linux-blink-web-tests-force-accessibility-rel`](https://source.chromium.org/chromium/chromium/src/+/main:infra/config/subprojects/chromium/try/tryserver.chromium.accessibility.star;drc=adad4c6d55e69783ba1f16d30f4bc7367e2e626a;bpv=0;bpt=0) 같은 전용 빌더일 수도 있다.

## 테스트 실패 추적하기

웹 테스트 실패와 관련된 모든 버그에는 [Test-Layout](https://crbug.com/?q=label:Test-Layout) 라벨이 있어야 한다. 버그에 대해 얼마나 알고 있는지에 따라 상태를 적절히 지정한다.

* **Unconfirmed** -- 이것이 단순 리베이스라인인지, 기존 버그의 가능한 중복인지, 실제 실패인지 확실하지 않다.
* **Untriaged** -- 확인되었지만 우선순위나 근본 원인이 불확실하다.
* **Available** -- 문제의 근본 원인을 알고 있다.
* **Assigned** 또는 **Started** -- 이 문제를 수정할 예정이다.

새 웹 테스트 버그를 만들 때는 다음 속성을 설정하라.

* Components: Blink의 하위 컴포넌트
* OS: **All**(또는 실패가 발생한 OS)
* Priority: 2(크래시라면 1)
* Type: **Bug**
* Labels: **Test-Layout**

이 라벨들을 미리 설정해 주는 _Layout Test Failure_ 템플릿을 사용할 수도 있다.

## 웹 테스트 디버깅하기

웹 테스트가 실행된 후에는 통과하거나 실패한 테스트의 요약을 받게 된다. 무언가가 예기치 않게 실패하면(새 회귀), 예상치 못한 실패의 요약이 있는 `content_shell` 창이 나타난다. 또는 조사하려는 실패 테스트가 이미 있을 수도 있다. 어떤 경우든 문제를 찾기 위한 몇 가지 단계와 팁은 다음과 같다.

* 결과를 살펴본다. 때로는 테스트가 패치에서 도입된 변경 사항을 반영하기 위해 리베이스라인(아래 참조)만 필요로 한다.
    * 테스트를 trunk Chrome 또는 content_shell 빌드에 로드하고 결과를 살펴본다. (http/ 디렉터리의 테스트는 먼저 http 서버를 시작한다. 위를 참고하라. `http://localhost:8000/`로 이동해 거기서부터 진행한다.) 좋은 테스트는 무엇을 확인하는지 설명하지만, 모든 테스트가 그런 것은 아니며, 때로는 명시적으로 테스트하지 않는 것들이 여전히 깨져 있을 수 있다. 필요한 경우 Safari, Firefox, IE와 비교하여 올바른지 확인한다. 그래도 확실하지 않으면 그 내용을 가장 잘 아는 사람을 찾아 물어본다.
    * 일부 테스트는 Chrome이 아니라 content_shell에서만 제대로 동작한다. 그곳에 노출된 추가 API에 의존하기 때문이다.
    * 일부 테스트는 content_shell에 직접 로드했을 때가 아니라 웹 테스트 프레임워크에서 실행될 때만 제대로 동작한다. 테스트의 보이는 텍스트에 그 내용이 언급되어 있어야 하지만, 모든 테스트가 그렇지는 않다. 그러므로 그것도 시도해 보라. 위의 "테스트 실행하기"를 참고하라.
* 테스트가 올바르다고 생각한다면, 기대 결과와 실제 결과 사이의 diff를 살펴보며 의심을 확인한다.
    * 보고된 diff가 중요하지 않은지 확인한다. 간격이나 박스 크기의 작은 차이는 특히 글꼴과 폼 컨트롤 주변에서 중요하지 않은 경우가 많다. JS 오류 메시지의 문구 차이도 대개 허용 가능하다.
    * `third_party/blink/tools/run_web_tests.py path/to/your/test.html`은 모든 테스트 결과를 나열하는 페이지를 생성한다. 기대값에 실패한 테스트에는 기대 결과, 실제 결과, diff에 대한 링크가 포함된다. 이 결과는 `$root_build_dir/layout-test-results`에 저장된다.
        * 또는 `--results-directory=path/for/output/` 옵션을 사용해 출력이 저장될 대체 디렉터리를 지정할 수 있다.
    * 그래도 올바르다고 확신한다면 테스트를 리베이스라인한다(아래 참조). 그렇지 않다면...
* 운이 좋다면, 테스트는 content_shell에서 일반적으로 탐색했을 때 제대로 실행되는 테스트일 것이다. 이 경우 Debug content_shell 프로젝트를 빌드하고, 선호하는 디버거에서 실행한 뒤, `file:` URL에서 테스트 파일을 로드한다.
    * content_shell을 여러 번 시작하고 중지하게 될 가능성이 높다. VS에서는 매번 테스트로 이동하는 일을 줄이기 위해 content_shell 프로젝트 Properties의 Debugging 섹션에서 명령 인수로 테스트 URL(`file:` 또는 `http:`)을 설정할 수 있다.
    * 테스트에 JS 호출, DOM 조작 또는 실패한다고 생각되는 다른 특징적인 코드 조각이 포함되어 있다면 Chrome 솔루션에서 그것을 검색한다. 문제 추적을 시작하기 위한 시작 브레이크포인트를 두기에 좋은 위치다.
    * 그렇지 않다면 Chrome에서와 마찬가지로 표준 메시지 루프에서 실행 중이다. 다른 정보가 없다면 페이지 로드에 브레이크포인트를 설정한다.
* 테스트가 전체 웹 테스트 모드에서만 동작하거나, 대화형 세션의 모든 오버헤드 없이 디버깅하는 것이 더 간단하다면, `--run-web-tests` 명령줄 플래그와 테스트에 대한 URL(`file:` 또는 `http:`)을 붙여 content_shell을 시작한다. content_shell에서 웹 테스트를 실행하는 방법에 대한 자세한 정보는 [여기](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_in_content_shell.md)에서 찾을 수 있다.
    * VS에서는 content_shell 프로젝트 Properties의 Debugging 섹션에서 이 작업을 할 수 있다.
    * 이제 웹 테스트가 사용하는 것과 정확히 같은 API, 테마 및 기타 설정으로 실행 중이다.
    * 다시 말해, 테스트에 JS 호출, DOM 조작 또는 실패한다고 생각되는 다른 특징적인 코드 조각이 포함되어 있다면 Chrome 솔루션에서 그것을 검색한다. 문제 추적을 시작하기 위한 시작 브레이크포인트를 두기에 좋은 위치다.
    * 브레이크포인트를 설정할 더 나은 위치를 찾을 수 없다면 `content_shell_main.cc`의 `TestShell::RunFileTest()` 호출이나 `content_shell_win.cc`의 `shell->LoadURL() within RunFileTest()`에서 시작한다.
* 평소처럼 디버깅한다. 여기까지 왔다면 실패한 웹 테스트는 문제를 드러내는 (바라건대) 축소된 테스트 케이스일 뿐이다.

### HTTP 테스트 디버깅하기

참고: HTTP Tests는 WebKit Layout Tests에서 유래한 스위트의 하위 집합인 `web_tests/http/tests/` 아래의 테스트를 의미한다. WPT의 HTTP 동작을 디버깅하려면 대신 ["Web platform tests"](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_platform_tests.md)를 읽어야 한다.


실패를 재현/디버깅하기 위해 서버를 수동으로 실행하려면 다음을 사용한다.

```bash
third_party/blink/tools/run_blink_httpd.py
```

웹 테스트는 `http://127.0.0.1:8000/`에서 제공된다. 예를 들어 `web_tests/http/tests/serviceworker/chromium/service-worker-allowed.html` 테스트를 실행하려면 `http://127.0.0.1:8000/serviceworker/chromium/service-worker-allowed.html`로 이동한다. 일부 테스트는 `127.0.0.1`로 갈 때와 `localhost`로 갈 때 다르게 동작하므로 `127.0.0.1`을 사용하라.

서버를 종료하려면 `run_blink_httpd.py`가 실행 중인 터미널에서 아무 키나 누르거나, Windows에서는 `taskkill` 또는 Task Manager를 사용하고, macOS에서는 `killall` 또는 Activity Monitor를 사용한다.

테스트 서버는 `web_tests/resources` 디렉터리에 대한 별칭을 설정한다. 예를 들어 HTTP 테스트에서는 `src="/js-test-resources/js-test.js"`를 사용해 테스트 프레임워크에 접근할 수 있다.

### 팁

각 빌더에서 가장 최근 ~100개 빌드에서 테스트가 어떻게 되었는지 보려면 https://test-results.appspot.com/ 를 확인하라(페이지가 정기적으로 업데이트되고 있는 한).

타임아웃은 종종 텍스트 불일치이기도 하다. 래퍼 스크립트가 content_shell이 끝낼 기회를 갖기 전에 종료하기 때문이다. 예외는 테스트가 제대로 로드를 마쳤지만, 어떻게든 완료되었음을 래퍼에 알리는 텍스트 조각을 출력하기 전에 멈추는 경우다.

테스트가 buildbot에서는 실패(또는 크래시, 타임아웃)하지만 로컬 머신에서는 통과하는 이유는 무엇일 수 있을까?
* 테스트가 로컬에서는 끝나지만 느리다면, 대략 10초 이상 걸린다면, 그것이 봇에서 타임아웃으로 불리는 이유일 것이다.
* 그렇지 않다면 테스트 집합의 일부로 실행해 본다. 이 테스트보다 하나나 둘(또는 열 개) 앞의 테스트가 무언가를 오염시켜 이 테스트가 실패하게 만들 가능성이 있다.
* 로컬에서 일관되게 동작한다면, 환경이 봇의 환경과 비슷한지 확인한다(webkit_tests step의 stdio 상단을 보면 모든 환경 변수 등을 볼 수 있다).
* 그 어느 것도 도움이 되지 않고 봇 자체에 접근할 수 있다면, 그곳에 로그인하여 문제를 수동으로 재현할 수 있는지 확인해야 할 수도 있다.

### DevTools 테스트 디버깅하기

* 다음 중 하나를 수행한다.
    * 옵션 A) `chromium/src` 폴더에서 실행:
      `third_party/blink/tools/run_web_tests.py --additional-driver-flag='--remote-debugging-port=9222' --additional-driver-flag='--remote-allow-origins=*' --additional-driver-flag='--debug-devtools' --timeout-ms=6000000`
    * 옵션 B) http/tests/inspector 테스트를 디버깅해야 한다면, 위에서 설명한 대로 httpd를 시작한다. 그런 다음 content_shell을 실행한다.
      `out/Default/content_shell --remote-debugging-port=9222 --additional-driver-flag='--remote-allow-origins=*' --additional-driver-flag='--debug-devtools' --run-web-tests http://127.0.0.1:8000/path/to/test.html`
* stable/beta/canary Chrome에서 `http://localhost:9222`를 열고, 단일 링크를 클릭해 테스트가 로드된 devtools를 연다.
* 로드된 devtools에서 필요한 브레이크포인트를 설정하고 콘솔에서 `test()`를 실행해 실제로 테스트를 시작한다.

NOTE: 테스트가 html 파일이라면 이는 레거시 테스트라는 의미이므로 다음을 추가해야 한다.
* 테스트 코드에 다음과 같이 `window.debugTest = true;`를 추가한다.

  ```javascript
  window.debugTest = true;
  function test() {
    /* TEST CODE */
  }
  ```

### flaky inspector protocol 테스트 재현하기

https://crrev.com/c/5318502 는 inspector-protocol 테스트를 위한 로깅을 구현했다. 이 CL을 사용하면 각 테스트의 stderr에서 테스트와 브라우저가 주고받은 Chrome DevTools Protocol 메시지를 볼 수 있어야 한다.

이 로그를 사용해 실패나 타임아웃을 로컬에서 재현할 수 있다.

* 로그 파일을 준비하고 각 줄이 JSON 형식의 프로토콜 메시지 하나를 포함하도록 한다. 원본 로그에서 prefix나 비프로토콜 메시지를 제거한다.
* 로컬 테스트 파일 버전이 로그 파일을 생성한 버전과 일치하는지 확인한다.
* 로그 파일을 사용해 테스트를 실행한다.

  ```sh
  third_party/blink/tools/run_web_tests.py -t Release \
   --additional-driver-flag="--inspector-protocol-log=/path/to/log.txt" \
   http/tests/inspector-protocol/network/url-fragment.js
  ```

## 회귀 이등분하기

[`git bisect`](https://git-scm.com/docs/git-bisect)를 사용하면 어떤 커밋이 웹 테스트를 깨뜨렸는지(또는 고쳤는지!) 완전히 자동화된 방식으로 찾을 수 있다. 미리 빌드된 Chromium 바이너리를 다운로드하는 [bisect-builds.py](http://dev.chromium.org/developers/bisect-builds-py)와 달리, `git bisect`는 로컬 체크아웃에서 동작하므로 `content_shell`로 테스트를 실행할 수 있다.

이등분에는 몇 시간이 걸릴 수 있지만, 완전히 자동화되어 있으므로 밤새 실행해 두고 다음 날 결과를 볼 수 있다.

웹 테스트 회귀의 자동 이등분을 설정하려면 다음과 같은 스크립트를 만든다.

```bash
#!/bin/bash

# 종료 코드 125는 git bisect에 해당 리비전을 건너뛰라고 알린다.
gclient sync || exit 125
autoninja -C out/Debug -j100 blink_tests || exit 125

third_party/blink/tools/run_web_tests.py -t Debug \
  --no-show-results --no-retry-failures \
  path/to/web/test.html
```

`out` 디렉터리, ninja args, 테스트 이름을 적절히 수정하고 스크립트를 `~/checkrev.sh`에 저장한다. 그런 다음 다음을 실행한다.

```bash
chmod u+x ~/checkrev.sh  # 스크립트를 실행 가능으로 표시한다
git bisect start <badrev> <goodrev>
git bisect run ~/checkrev.sh
git bisect reset  # bisect 세션을 종료한다
```

## 웹 테스트 리베이스라인하기

[How to rebaseline](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_expectations.md#How-to-rebaseline)을 참고하라.

## 알려진 문제

웹 테스트 러너를 포함한 Blink 도구 관련 문제는 [component Blink>Infra가 있는 버그](https://bugs.chromium.org/p/chromium/issues/list?can=2&q=component%3ABlink%3EInfra)를 참고하라.

* QuickTime이 설치되어 있지 않으면 플러그인 테스트 `fast/dom/object-embed-plugin-scripting.html` 및 `plugins/embed-attributes-setting.html`는 실패할 것으로 예상된다.
* Fluent scrollbar 렌더링에는 웹 테스트만을 위한 지오메트리와 동작 조정이 일부 있다. 이는 [Fluent Scrollbars Visual Spec](https://bit.ly/fluent-scrollbars-visual-spec)의 "Special rendering - Web tests" 아래에 설명되어 있다. 결국에는 이를 제거하고 싶다([crbug.com/382298324](https://crbug.com/382298324)).

원문: https://raw.githubusercontent.com/chromium/chromium/main/docs/testing/web_tests.md

## History

- 2026-07-06: Chromium `docs/testing/web_tests.md` 원문 전체를 한국어로 번역해 저장.
