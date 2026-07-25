---
title: Web Platform Tests
order: 36
group: 번역 · docs/testing
description: WPT 개요와 Chromium에서의 사용
source_path: docs/testing/web_platform_tests.md
source_sha256: 76555e05c742a5afc08fb67ccbb2367d23683d310714d0f099036e2b46431dc7
translation_status: full
---
> 이 문서는 **Web Platform Tests**([`docs/testing/web_platform_tests.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_platform_tests.md)) 문서의 한국어 전체 번역입니다.

브라우저 간 상호 운용성은 웹을 개선하려는 Chromium의 사명에
[매우 중요](https://www.chromium.org/blink/platform-predictability)합니다. 우리는 공유 테스트 스위트를 활용하고 이에 기여하는 것이 브라우저 간 상호 운용성을 달성하는 데 가장 중요한 도구 중 하나라고 믿습니다. [web-platform-tests 저장소](https://github.com/web-platform-tests/wpt)는 모든 브라우저 엔진이 협업하는 주된 공유 테스트 스위트입니다.

Chromium은 업스트림 web-platform-tests 저장소와 양방향 가져오기/내보내기 프로세스를 갖고 있습니다. 테스트는
[web_tests/external/wpt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt)로 가져오며, 가져온 테스트에 대한 변경 사항도 web-platform-tests로 내보냅니다.

테스트 작성 및 리뷰 팁을 포함한 web-platform-tests에 대한 일반 문서는 https://web-platform-tests.org/ 를 참조하세요.


## 테스트 작성

web-platform-tests에 변경 사항을 기여하려면 변경 사항을
[web_tests/external/wpt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt)에 직접 커밋하면 됩니다. 변경 사항은 24시간 이내에 자동으로 업스트림됩니다.

테스트를 추가, 제거 또는 수정하는 변경 사항은 모두 업스트림될 수 있습니다.
[external/wpt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt) 밖의 변경 사항은 업스트림되지 않으며, `*-expected.txt`, `OWNERS`, `MANIFEST.json` 변경 사항도 업스트림되지 않습니다.

웹 테스트를 실행하면 로컬 수정 사항을 반영하도록 MANIFEST.json이 자동으로 다시 생성됩니다.

대부분의 테스트는 testharness.js를 사용해 작성됩니다. 일반 지침은
[Writing Web Tests](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/writing_web_tests.md) 및
[Web Tests Tips](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_tips.md)를 참조하세요.

### 명세에 맞춰 테스트 작성

web-platform-tests의 테스트는 관련 명세에 정의된 동작과 일치해야 합니다. 다시 말해, 테스트가 수행하는 모든 assertion은 명세의 규범적 요구사항에서 파생되어야 하며, 그 범위를 넘어서는 안 됩니다. 무엇이 요구되고 무엇이 요구되지 않는지 명확히 하기 위해 명세를 변경해야 하는 경우도 자주 있습니다.

명세 작업에 정보를 제공하기 위해 구현 경험이 필요할 때는
[잠정 테스트](https://web-platform-tests.org/writing-tests/file-names.html)가 적절할 수 있습니다. 그 테스트가 왜 잠정적인지, 그리고 잠정 상태가 아니게 만들기 위해 무엇이 해결되어야 하는지는 문맥상 분명해야 합니다.

### 테스트 커버리지

좋은 테스트 스위트는 웹 개발자가 브라우저 간 큰 차이를 겪지 않도록 하면서, 기능에 대한 독립적인 상호 운용 구현을 가능하게 합니다.

* **기능 존재 여부 테스트:** 보통 API의 경우 idlharness.js, CSS의 경우 parsing-testcommon.js 같은 표면 수준 테스트로 수행됩니다. 이러한 테스트는 실제 동작을 검증하지 않습니다.
  * API 예: [idle-detection/idlharness.https.window.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/idle-detection/idlharness.https.window.js)
  * CSS 예: [css/css-logical/parsing/inset-valid.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/css/css-logical/parsing/inset-valid.html)
* **일반적인 사용 사례 테스트:** 기능을 현실적이고 직관적인 방식으로 사용하고 예상 동작을 검증합니다.
  * API 예: [requestidlecallback/basic.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/requestidlecallback/basic.html)
  * CSS 예: [css/css-flexbox/gap-001-ltr.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/css/css-flexbox/gap-001-ltr.html)
  * HTTP 예: [cors/basic.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/cors/basic.htm)
* **발생 가능성이 높은 오류 시나리오 테스트:** 범위를 벗어난 입력, 네트워크 오류, 사용자가 권한 프롬프트를 거부하는 경우 같은 현실적인 오류 시나리오를 테스트합니다.
  * API 예: [fetch/api/basic/error-after-response.any.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/fetch/api/basic/error-after-response.any.js)
  * CSS 예: [css/css-color/hsl-clamp-negative-saturation.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/css/css-color/hsl-clamp-negative-saturation.html)
  * HTTP 예: [client-hints/accept-ch-malformed-header.https.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/client-hints/accept-ch-malformed-header.https.html)
* **무효화 테스트:** 입력이 변경될 때 렌더링 또는 기타 출력이 무효화되어야 하는 경우가 많습니다. 이런 종류의 테스트는 CSS 기능에서 흔하지만, 다른 기능에도 의미가 있을 수 있습니다. 초기 상태가 스크립트에 의해 갱신되는 경우 흔히 “동적”이라고 부릅니다.
  * API 예: [dom/nodes/Element-childElementCount-dynamic-add.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/dom/nodes/Element-childElementCount-dynamic-add.html)
  * CSS 예: [css/css-content/quotes-lang-dynamic-001.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/css/css-content/quotes-lang-dynamic-001.html)
* **다른 기능과의 통합 테스트:** 해당 기능이 다른 기능과 의미 있는 방식으로 통합된다면, 두 기능의 조합이 예상대로 동작하는지 테스트합니다.
  * API 예: [permissions-policy/reporting/fullscreen-reporting.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/permissions-policy/reporting/fullscreen-reporting.html)
  * CSS 예: [css/css-anchor-position/anchor-scroll-to-sticky-001.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/css/css-anchor-position/anchor-scroll-to-sticky-001.html)
  * HTTP 예: [clear-site-data/set-cookie-before-clear-cookies.https.html](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/clear-site-data/set-cookie-before-clear-cookies.https.html)

### 테스트 API가 필요한 테스트

#### `testdriver.js`

[testdriver.js](https://web-platform-tests.org/writing-tests/testdriver.html)를 사용한 자동화의 경우
[Guide to Adding New Web Features to WPT](https://docs.google.com/document/d/1uQmNMUzznAH_JvJOTllpL2qNhOEzClTkmZliTnlsNIs/edit?usp=sharing)를 따르세요.
testdriver.js는 일반 Blink 웹 테스트의 `internals.*` 및 `eventSender.*`와 유사하게, 순수 웹 플랫폼 API만으로는 작성할 수 없는 테스트를 자동화하는 수단을 제공합니다. 이는 [WebDriver Classic](https://www.w3.org/TR/webdriver/) 또는 [WebDriver BiDi](https://www.w3.org/TR/webdriver-bidi/) 프로토콜을 사용합니다.

[WPT Test Automation for Chromium](https://docs.google.com/document/d/18BpD41vyX1cFZ77CE0a_DJYlGpdvyLlx3pwXVRxUzvI/edit?usp=sharing) 개요.

`testdriver.js`를 확장하는 권장 방식은 [WebDriver BiDi](https://www.w3.org/TR/webdriver-bidi/) 프로토콜을 확장하여 추가하는 것입니다.

##### WebDriver BiDi 명세

WebDriver BiDi 프로토콜은 브라우저 간 테스트를 지원하도록 설계되었습니다. 설계상 확장 가능하며, 별도 명세를 통해 확장될 수 있습니다.

###### 예

[WebDriver BiDi 확장 모듈](https://www.w3.org/TR/webdriver-bidi/#protocol-modules) `permissions`는 외부 명세 https://www.w3.org/TR/permissions/#automation-webdriver-bidi 에 설명되어 있습니다.

##### WPT wdspec 테스트

명세 부분에는 WPT wdspec 테스트가 함께 제공되어야 합니다. 이 테스트를 통해 구현체는 BiDi 확장을 제대로 구현했는지 검증할 수 있습니다. 프로세스는 여기 설명되어 있습니다: https://web-platform-tests.org/writing-tests/wdspec.html#extending-webdriver-bidi.

###### 예

permissions.setPermission 명령에 대한 WPT 테스트: webdriver/tests/bidi/external/permissions/set_permission.

##### CDP에 필요한 엔드포인트 구현

내부적으로 Chromium은 Chrome Devtools Protocol(https://chromedevtools.github.io/devtools-protocol/)에 의해 제어됩니다. 이는 WebDriver BiDi 명령을 구현하기 위해 해당 명령을 CDP에 추가해야 함을 의미합니다.

##### CDP를 사용해 WebDriver BiDi 명령 구현

[BiDi-CDP Mapper](https://github.com/GoogleChromeLabs/chromium-bidi)는 Chromium에서 WebDriver BiDi를 구현한 것이며 ChromeDriver가 사용합니다. 이는 WebDriver BiDi 명령을 Chrome DevTools Protocol(CDP) 명령으로 변환합니다.

[새 명령을 BiDi-CDP Mapper에 추가하고 ChromeDriver에 롤링하는 방법](https://github.com/GoogleChromeLabs/chromium-bidi#adding-new-command).

###### 예

[”permissions.setPermission” 구현](https://github.com/GoogleChromeLabs/chromium-bidi/pull/1645).

##### `testdriver.js` 확장

새 메서드를 WPT 테스트에 노출하려면 `testdriver.js`를 새 메서드로 업데이트해야 합니다. 이 프로세스는 [“Testdriver extension tutorial”](https://web-platform-tests.org/writing-tests/testdriver-extension-tutorial.html)에 설명되어 있으며, “WebDriver BiDi” 섹션에서 참조됩니다.

###### 예

[`test_driver.bidi.permissions.set_permission` 추가](https://github.com/web-platform-tests/wpt/pull/49170).

#### MojoJS

일부 명세는 테스트 API(예: [WebUSB](https://wicg.github.io/webusb/test/))를 정의할 수 있으며, 이는 [MojoJS](https://chromium.googlesource.com/chromium/src/+/main/mojo/public/js/README.md) 같은 내부 API로 폴리필될 수 있습니다. MojoJS는 WPT에서 오직 이 목적을 위해서만 허용됩니다. 테스트 전용 API를 새로 추가하기 위해 아래 프로세스를 따르기 전에 blink-dev@chromium.org 로 문의하세요.

 1. 필요한 모든 `*.mojom.m.js` 파일의 전체 목록을 작성하세요. 모든 의존성을 포함해야 합니다. 생성된 모듈은 기본적으로 의존성을 재귀적으로 로드하므로, DevTools의 네트워크 패널을 확인해 로드되는 전체 의존성 목록을 볼 수 있습니다.
 2. [linux-archive-rel.json](https://chromium.googlesource.com/chromium/src/+/main/infra/archive_config/linux-archive-rel.json)을 확인하고 누락된 `*.mojom.m.js` 파일을 `mojojs.zip` 아카이브에 추가하세요. `filename`에서는 glob이 지원됩니다. Mojom 바인딩을 WPT에 복사하지 마세요.
 3. 동시에 Chromium에서는 [test-only-api.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/resources/test-only-api.js)를 사용해 브라우저별 설정을 수행하는 WPT 테스트용 헬퍼를 만들 수 있습니다. 예시는 [webxr_util.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt/webxr/resources/webxr_util.js)를 참조하세요. 이 헬퍼를 사용해 즉시 테스트를 작성할 수 있지만, 2단계의 변경 사항이 공식 채널에 포함되기 전까지는 업스트림(즉 https://wpt.fyi 에서)에서는 동작하지 않습니다. `mojojs.zip`은 Chrome과 함께 빌드되기 때문입니다.

#### `wpt_automation`

위 옵션들의 대안은 [wpt_automation](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt_automation)의 스크립트로 자동화되는 수동 테스트를 작성하는 것입니다. 수동 테스트에 JS를 주입할지는 [testharnessreport.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/testharnessreport.js)의 `loadAutomationScript`에 의해 결정됩니다.

이러한 테스트도 다른 브라우저 엔진에서 실행하려면 사례별 자동화가 필요하지만, 순수 수동 테스트보다는 더 가치가 있습니다.

자동화가 전혀 없는 수동 테스트도 가져오기는 하지만, [NeverFixTests](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/NeverFixTests)에서 건너뜁니다. [issue 738489](https://crbug.com/738489)를 참조하세요.

### 기여 프로세스

[web_tests/external/wpt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt)에서 이루어진 변경 사항은 [자동으로 GitHub로 내보내집니다](#테스트-내보내기).

web-platform-tests에 직접 pull request를 만드는 것도 여전히 가능합니다. https://web-platform-tests.org/writing-tests/github-intro.html 를 참조하세요.

### `wpt_internal`

Chromium 고유 동작을 테스트하거나 아직 WPT로 업스트림할 수 없는 테스트(예: 명세가 매우 초기 단계인 경우)를 WPT 테스트로 작성하고 싶은 경우가 있습니다. 이러한 경우를 위해 우리는 [wpt_internal](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/wpt_internal)이라는 별도 디렉터리를 유지합니다. 이 디렉터리는 WPT 테스트 인프라(예: wptserve 등) 아래에서 실행되지만 WPT로 업스트림되지는 않습니다.

자세한 내용은 `wpt_internal` [README](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/wpt_internal/README.md)를 참조하세요.

**참고**: `wpt_internal`의 큰 단점은 업스트림 리소스 스크립트(예: `testharness.js`) 변경으로 인해 테스트가 깨질 수 있다는 점입니다. `wpt_internal`은 다른 모든 비-`external/wpt` 테스트가 사용하는 fork된 `testharness.js` 버전을 사용하지 않기 때문입니다. 깨짐을 통지받을 수 있도록 [새 실패 알림](#새-실패-알림)을 사용하는 것이 권장됩니다.

## 테스트 실행

Blink 웹 테스트와 마찬가지로, 어떤 WPT 테스트든 [`run_web_tests.py`](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md#running-the-tests)를 사용해 실행할 수 있습니다. 이는 Content Shell에서 WPT 테스트를 실행합니다. Chrome으로 WPT 테스트를 실행하려면 [`run_wpt_tests.py`](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/run_web_platform_tests.md)도 사용할 수 있습니다.

한 가지 주의할 점은 WPT 테스트에 대한 glob 패턴은 아직 지원되지 않는다는 것입니다.

디버깅 등은 [Content Shell에서 WPT 테스트 실행](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_in_content_shell.md#Running-WPT-Tests-in-Content-Shell)을 참조하세요.

## 테스트 리뷰

Chromium에서 코드와 테스트를 리뷰할 수 있는 사람은 자동으로 업스트림될 [external/wpt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt)의 변경 사항도 리뷰할 수 있습니다. 내보내기 프로세스의 일부로 web-platform-tests에서 추가 리뷰는 없습니다.

업스트림 리뷰어가 변경 사항에 대한 피드백을 제공하면, 내보내기 중 생성된 pull request에서 논의하고, 필요하다면 모두가 만족할 때까지 새 pull request에서 반복 작업하세요.

테스트를 리뷰할 때는 관련 명세와 일치하는지 확인하세요. 이는 구현과 완전히 일치하지 않을 수 있습니다. [명세에 맞춰 테스트 작성](#명세에-맞춰-테스트-작성)도 참조하세요.

## 테스트 가져오기

Chromium은 GitHub 저장소의 [미러](https://chromium.googlesource.com/external/w3c/web-platform-tests/)를 갖고 있으며, 정기적인 Blink 웹 테스트 테스트 프로세스의 일부로 실행하기 위해 테스트의 일부를 주기적으로 가져옵니다.

이 프로세스의 목표는 Blink 테스트를 실행하는 것만큼 쉽게 web-platform-tests를 수정 없이 로컬에서 실행할 수 있게 하고, web-platform-tests 저장소의 tip-of-tree를 가능한 한 긴밀하게 추적하며, 가능한 한 많은 테스트를 실행하는 것입니다.

### 자동 가져오기 프로세스

Chromium의 web-platform-tests 사본을 업데이트하는 자동 프로세스가 있습니다. 가져오기는 [wpt-importer builder][wpt-importer] 빌더가 수행합니다.

최근 가져오기 상태를 확인하는 가장 쉬운 방법은 다음을 보는 것입니다.

-   [wpt-importer builder][wpt-importer]의 LUCI 최근 로그
-   [WPT Autoroller](https://chromium-review.googlesource.com/q/owner:wpt-autoroller%2540chops-service-accounts.iam.gserviceaccount.com)가 만든 최근 CL

가져오기 작업은 일반적으로 할 일이 없었거나 CL이 성공적으로 제출되었으면 green 상태가 됩니다.

관리자를 위한 정보:

-   소스는 [third_party/blink/tools/wpt_import.py](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/tools/wpt_import.py)에 있습니다.
-   importer가 오동작하기 시작하면 [업데이트 단계를 건너뛰는 CL](https://crrev.com/c/1961906/)을 landed하여 비활성화할 수 있습니다.

### 새 실패 알림

가져온 변경 사항이 실패를 유발할 때, 테스트 소유자가 실패 알림 메커니즘에서 opt-out하지 않은 한 importer는 자동으로 컴포넌트에 대해 버그를 filing합니다. 여기에는 Chromium에서 실패하는 새 테스트와 기존 테스트에 새로 도입된 실패가 모두 포함됩니다. 테스트 소유자는 적절한 `external/wpt/` 하위 디렉터리에 최소한 `buganizer_public.component_id` 필드를 포함하는 `DIR_METADATA` 파일을 만들 것을 권장받습니다. importer는 이 필드를 사용해 버그를 filing합니다.
예를 들어 `external/wpt/css/css-grid/DIR_METADATA`는 다음과 같습니다.

```
buganizer_public {
  component_id: 1415957
}
team_email: "layout-dev@chromium.org"
```

`external/wpt/css/css-grid/` 아래의 테스트가 WPT 가져오기에서 새로 실패하면, importer는 실패한 테스트와 출력의 세부 사항과 함께 [issues.chromium.org](https://issues.chromium.org/issues)의 `Chromium>Blink>Layout>Grid` 컴포넌트에 대해 자동으로 버그를 filing합니다.
importer는 또한 `layout-dev@chromium.org`(`team_email`)와 모든 `external/wpt/css/css-grid/OWNERS`를 버그에 복사합니다.

실패한 테스트는 roll up되는 가장 구체적인 `DIR_METADATA`에 따라 그룹화됩니다.

이 알림에서 opt-out하려면 해당 `DIR_METADATA`에 `wpt.notify` 필드를 추가하고 `NO`로 설정하세요.
예를 들어 다음 `DIR_METADATA`는 위치한 디렉터리 아래 테스트의 알림을 억제합니다.

```
buganizer_public {
  component_id: 1415957
}
team_email: "layout-dev@chromium.org"
wpt {
  notify: NO
}
```

### 건너뛴 테스트(및 다시 활성화하는 방법)

어떤 테스트를 가져올지는 [W3CImportExpectations](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/W3CImportExpectations)라는 파일로 제어합니다. 이 파일에는 가져오기 중 건너뛸 디렉터리 목록이 있습니다.

거기에 명시적으로 건너뛰도록 지정된 디렉터리와 테스트 외에도, 파일 경로가 Windows에 너무 긴 경우 등 몇 가지 다른 이유로 테스트가 건너뛰어질 수 있습니다. 가져오기에서 어떤 파일이 건너뛰어지는지 확인하려면 [wpt-importer builder][wpt-importer]의 최근 로그를 확인하세요.

현재 `W3CImportExpectations`에서 건너뛰고 있는 일부 디렉터리를 건너뛰지 않도록 하고 싶다면, 해당 파일을 로컬에서 수정해 커밋하면 됩니다. 다음 자동 가져오기 때 새 테스트가 가져와질 것입니다.

즉시 가져오고 싶다면(테스트를 로컬에서 시험해 보기 위해서 등) `wpt-import`를 실행할 수도 있지만, 필수는 아닙니다.

가져오기가 GitHub의 인증되지 않은 요청 제한 때문에 실패할 수 있음을 기억하세요. 따라서 스크립트에 [GitHub 자격 증명을 전달](#github-자격-증명)하는 것을 고려하세요.

### 자동 가져오기로 인한 waterfall 실패

자동 가져오기 이후 새 테스트 실패가 발생하는 경우, 가능한 원인은 여러 가지가 있습니다. 예를 들면 다음과 같습니다.

 1. flaky 테스트에 대한 새 baseline이 추가됨(https://crbug.com/701234).
 2. 수정된 테스트에 대해 non-Release 빌드용 새 결과가 필요했지만 추가되지 않음(https://crbug.com/725160).
 3. 비결정적 테스트 결과를 가진 테스트에 대해 새 baseline이 추가됨(https://crbug.com/705125).

이 테스트들은 Web Platform tests에서 가져온 것이므로, 저장소에 없게 하는 것보다 저장소에 두고(실패로 표시하더라도) 관리하는 편이 낫습니다. 따라서 되돌리기보다는 [테스트 expectation 추가](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_expectations.md)를 선호하세요.
하지만 매우 많은 수의 테스트가 실패한다면, 수동으로 고칠 수 있도록 CL을 revert해 주세요.

[wpt-importer]: https://ci.chromium.org/p/infra/builders/luci.infra.cron/wpt-importer

## 테스트 내보내기

[third_party/blink/web_tests/external/wpt](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/external/wpt)에 변경 사항이 있는 CL을 업로드하면, CL이 제출 준비가 되었을 때 exporter가 해당 변경 사항으로 [업스트림 WPT GitHub 저장소](https://github.com/web-platform-tests/wpt/)에 임시 pull request를 만듭니다.
exporter는 [wpt-exporter builder][wpt-exporter]에서 실행됩니다.

CL을 land할 준비가 되면 bot이 게시한 링크를 따라가서 GitHub PR의 필수 check 상태를 확인하세요. green이면 CL을 land하면 되고, exporter가 자동으로 PR을 merge합니다.

PR의 GitHub 상태가 red이면 merge하기 전에 실패를 해결해 보세요. 문제가 발생하거나 WPT 변경 사항이 포함된 CL을 exporter가 감지하지 못했다면 blink-dev@chromium.org 로 문의하세요.

CL이 제출 준비되기 전에 exporter를 실행하고 싶다면 CL 설명에 `Force-WPT-Export: true` 태그를 추가할 수 있습니다. 리뷰를 보내기 전에 GitHub에서 WPT 결과를 확인하고 싶을 때 유용할 수 있습니다.

추가로 유의할 사항:

-   1000개가 넘는 파일을 변경하는 CL은 내보내지지 않습니다.
-   모든 PR은 [`chromium-export`](https://github.com/web-platform-tests/wpt/pulls?utf8=%E2%9C%93&q=is%3Apr%20label%3Achromium-export) 라벨을 사용합니다.
-   아직 Chromium에 landed되지 않은 CL의 모든 PR은 [`do not merge yet`](https://github.com/web-platform-tests/wpt/pulls?q=is%3Apr+is%3Aopen+label%3A%22do+not+merge+yet%22) 라벨도 사용합니다.
-   exporter는 바이너리 파일(예: webm 파일)이 포함된 진행 중 CL에 대해서는 업스트림 PR을 만들 수 없습니다. CL이 land된 후에는 export PR이 만들어집니다.

### 내보낸 커밋이 내 GitHub 프로필에 연결되나요?

Chromium에서 커밋할 때 사용한 이메일이 GitHub 커밋의 author가 됩니다. 내보낸 커밋을 GitHub 프로필에 연결하려면 [GitHub 계정에 보조 주소로 추가](https://help.github.com/articles/adding-an-email-address-to-your-github-account/)할 수 있습니다.

Googler라면 go/github에서 GitHub 계정을 등록할 수도 있습니다. 그러면 다른 Googler가 당신을 더 쉽게 찾을 수 있습니다.

### 충돌이 있으면 어떻게 되나요?

두 저장소가 독립적이므로 이를 완전히 피할 수는 없지만, 잦은 가져오기와 내보내기로 인해 드물어야 합니다. 실제로 발생하면 수동 개입이 필요하며, 사소하지 않은 경우 충돌 해결을 도와 달라는 요청을 받을 수 있습니다.

[wpt-exporter]: https://ci.chromium.org/p/infra/builders/luci.infra.cron/wpt-exporter

## WPT 인프라 관리자를 위한 참고 사항

### Importer

#### Rubber-Stamper bot

importer가 사람의 개입 없이 CL을 land할 수 있도록 하기 위해, [Rubber-Stamper bot](https://chromium.googlesource.com/infra/infra/+/refs/heads/main/go/src/infra/appengine/rubber-stamper/README.md)을 사용해 import CL을 승인합니다.

Rubber-Stamper를 reviewer로 추가하는 것은 importer가 수행하는 마지막 단계 중 하나입니다. 테스트가 rebaseline되고 CQ가 통과한 뒤에 이루어집니다. Rubber-Stamper가 CL을 승인할 수 없으면 이유를 설명하는 comment를 CL에 남깁니다. 이는 importer를 red 상태로 만들기도 합니다.

![CL을 거부하는 Rubber-Stamber bot](https://raw.githubusercontent.com/chromium/chromium/main/docs/testing/images/wpt_import_rubber_stamper_reject.png)

Rubber-Stamper가 import를 거부하는 경우는 두 가지입니다. import가 코드 파일(`.py`, `.bat`, `.sh`)을 변경하기 때문에 유효한 거부인 경우, 또는 importer가 수정해도 되는 파일에 대한 allowlist 규칙이 누락되어 잘못 거부된 경우입니다.

유효한 거부의 경우, CL을 수동으로 land하는 것은 rotation sheriff의 일입니다. import의 abandon을 취소하고, 직접 `CR+1`을 주고, `CQ+2`를 주어야 합니다. 그렇게 할 권한이 없다면(예: committer가 아니라면) blink-dev@chromium.org 로 연락하세요.

잘못된 거부의 경우, blink-dev@chromium.org 로 메시지를 보내거나 직접 예외 규칙을 추가하세요. [이 CL](https://chrome-internal-review.googlesource.com/c/infradata/config/+/3608170)은 예외 규칙을 추가하는 예시입니다. (이 저장소에 접근하려면 내부 접근 권한이 필요하다는 점에 유의하세요.)

#### 수동 가져오기

현재 가져오고 있는 테스트의 최신 버전을 가져오려면 [wpt-import](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/tools/wpt_import.py) 스크립트를 직접 호출할 수도 있습니다.

이 스크립트는 업스트림 저장소의 미러에서 테스트의 최신 버전을 가져옵니다. 테스트의 새 버전이 발견되면 로컬 저장소에 로컬로 커밋됩니다. 그런 다음 변경 사항을 업로드할 수 있습니다.

가져오기가 GitHub의 인증되지 않은 요청 제한 때문에 실패할 수 있음을 기억하세요. 따라서 스크립트에 [GitHub 자격 증명을 전달](#github-자격-증명)하는 것을 고려하세요.

### Exporter

-   소스는 [third_party/blink/tools/wpt_export.py](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/tools/wpt_export.py)에 있습니다.
-   exporter가 오동작하기 시작하면(예: 같은 PR을 계속해서 만드는 경우), [이 CL](https://crrev.com/c/462381/)을 landed하여 "dry run" 모드로 넣으세요.

### wpt.fyi 통합

https://wpt.fyi/ 는 시간에 따른 브라우저 간 WPT 결과를 비교하는 대시보드입니다.
WPT에는 견고한 모바일 테스트 인프라가 없으므로, [Chrome 모바일 제품에 대한 wpt.fyi 결과][wpt-fyi-results](WebView, Clank, Bling)는 wpt의 GitHub Actions 대신 LUCI에서 생성되어 업로드됩니다.

각 제품에는 전체 WPT 스위트를 실행하는 CI 빌더가 있습니다.
빌더의 목적은 데이터를 수집하는 것이지 코드 변경을 검증하는 것이 아니므로, 테스트 실패가 retry를 유발하거나 빌드를 red로 만들지는 않습니다.
[`wpt-uploader` "builder"][wpt-uploader]는 주기적으로 최신 결과를 집계하고 이를 [wpt.fyi의 upload API][wpt-fyi-upload-api]로 보냅니다.

[wpt-fyi-results]: https://wpt.fyi/runs?label=master&product=chrome_android%5Bexperimental%5D&product=chrome_ios%5Bexperimental%5D&product=android_webview%5Bexperimental%5D&product=chrome_android%5Bstable%5D
[wpt-uploader]: https://ci.chromium.org/ui/p/infra/builders/cron/wpt-uploader
[wpt-fyi-upload-api]: https://github.com/web-platform-tests/wpt.fyi/blob/main/api/README.md#apiresultsupload

### GitHub 자격 증명

`wpt-import` 및 `wpt-export` 스크립트를 수동으로 실행할 때, pull request 상태 조회, 기존 exported commit 검색 등을 위해 GitHub에 여러 요청이 수행됩니다. GitHub는 인증되지 않은 요청에 대해 [상당히 낮은](https://developer.github.com/v3/#rate-limiting) 요청 제한을 갖고 있으므로, 요청을 보낼 때 `wpt-export`와 `wpt-import`가 GitHub 자격 증명을 사용하도록 하는 것이 권장됩니다.

 1. 새 [personal access token](https://github.com/settings/tokens)을 생성하세요.
 1. 다음 중 하나의 방법으로 자격 증명을 설정하세요.
     * `GH_USER` 환경 변수를 GitHub 사용자 이름으로 설정하고, `GH_TOKEN` 환경 변수를 방금 생성한 access token으로 설정합니다. **또는**
     * 두 개의 키를 가진 JSON 파일을 만듭니다. `GH_USER`에는 GitHub 사용자 이름을, `GH_TOKEN`에는 방금 생성한 access token을 넣습니다. 그런 다음 `wpt-export`와 `wpt-import`에 `--credentials-json <path-to-json>`을 전달합니다.

### 실패한 web platform tests 디버깅

이 섹션은 web platform tests를 디버깅하는 방법을 설명합니다.
아래 명령을 실행하기 전에 `blink_tests`를 빌드하세요.
이는 [Running Web Tests](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md#running-web-tests)에 설명되어 있습니다.

#### 테스트 실행

웹 테스트를 실행하는 방법은 [Running the Tests](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md#running-the-tests)에 설명되어 있습니다.

`wpt_internal/fake/foobar.html`이라는 테스트를 작성 중이라고 가정해 봅시다.
테스트만 실행하고 싶고 `wpt_internal/fake` 아래의 모든 테스트를 실행하고 싶지는 않을 수 있습니다. 다음 명령은 테스트 대상을 `wpt_internal/fake/foobar.html`만으로 좁힙니다.

```bash
third_party/blink/tools/run_web_tests.py -t Default \
third_party/blink/web_tests/wpt_internal/fake/foobar.html
```

#### 로깅

디버깅 중에는 테스트 중 어떤 일이 일어나는지 로그로 남기고 싶을 수 있습니다.
JavaScript에서 `console.log`를 사용해 임의의 문자열을 로그로 남길 수 있습니다.

```
e.g.
console.log('fake has been executed.');
console.log('foo=' + foo);
```

로그는 `$root_build_dir/layout-test-results` 아래에 기록됩니다.
`wpt_internal/fake/foobar.html`을 테스트했다면, 로그는 `$root_build_dir/layout-test-results/wpt_internal/fake/foobar-stderr.txt`에 저장됩니다.
`--results-directory=<output directory>`로 출력 디렉터리를 변경할 수 있습니다.

#### HTTP 서버 확인

일부 테스트 사례에서는 임의의 HTTP 헤더를 설정하기 위해 .headers 파일을 사용할 수 있습니다.
헤더에 무엇이 설정되었는지 확인하려면 WPT용 HTTP 서버를 직접 실행할 수 있습니다. 다음 명령은 HTTP 서버를 시작합니다.

```bash
third_party/blink/tools/run_blink_wptserve.py
```

서버가 반환하는 헤더를 보려면 `curl -v`를 사용할 수 있습니다.
`curl`은 헤더를 stderr에 표시합니다. 출력이 너무 길면 `|& less`를 사용해 보고 싶을 수 있습니다.

```bash
curl -v http://localhost:8081/wpt_internal/fake/foobar.html |& less
```

#### 디버거로 디버깅

특정 WPT 테스트에 대해 디버거로 Chromium 내부를 디버깅할 수 있습니다. 자세한 내용은 [content shell을 사용한 웹 테스트 실행](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/testing/web_tests_in_content_shell.md)을 참조하세요.
