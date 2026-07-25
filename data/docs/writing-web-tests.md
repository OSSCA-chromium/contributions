---
title: 웹 테스트 작성하기
order: 37
group: 번역 · docs/testing
description: 웹 테스트 작성 방법
source_path: docs/testing/writing_web_tests.md
source_sha256: bb3c882e8f01869bbe2e05371d1c4249d091443f283c360a57545d6f2cff1790
translation_status: full
---
> 이 문서는 **Writing Web Tests**([`docs/testing/writing_web_tests.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/writing_web_tests.md)) 문서의 한국어 전체 번역입니다.

## 개요

웹 테스트는 다음 목표 중 하나를 달성하기 위해 사용해야 한다.

1. 웹에 노출되는 Blink의 전체 표면은 우리가 [web-platform-tests](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_platform_tests.md)
   (WPT)에 기여하는 테스트로 커버되어야 한다. 이는 회귀를 피하는 데 도움이 되며,
   주요 브라우저들이 상호 운용 가능한 구현을 갖추지 못한 웹 플랫폼 영역을 식별하는 데 도움이 된다.
   더 나아가 WPT 같은 프로젝트에 기여함으로써, 우리는 다른 브라우저 벤더들과 테스트 작성 부담을
   공유하고 모든 브라우저가 더 나아지도록 돕는다. 이는 웹을 앞으로 나아가게 하려는 우리의 목표와
   매우 잘 부합한다.
2. Blink 기능을 WPT가 제공하는 도구로 테스트할 수 없고,
   [C++ 단위 테스트](https://cs.chromium.org/chromium/src/third_party/blink/renderer/web/tests/?q=webframetest&sq=package:chromium&type=cs)로
   쉽게 커버할 수도 없는 경우, 예상치 못한 회귀를 피하기 위해 해당 기능은 웹 테스트로 커버해야 한다.
   이러한 테스트는 [content_shell](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_in_content_shell.md)에서만 사용할 수 있는
   Blink 전용 테스트 API를 사용한다.

참고: Web Platform Test에 대한 가이드를 찾고 있다면
["Web platform tests"](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_platform_tests.md)(WPT)를 읽어야 한다. 이 문서는 WPT 고유 기능/동작을
다루지 않는다. **오늘날에는 아래에 언급된 테스트 유형보다 WPT가 권장된다!**

*** promo
Blink 웹 테스트가 [test262](https://github.com/tc39/test262) 같은 다른 프로젝트로 업스트림된다는 것을 알고 있다면
이 문서를 업데이트해 달라. 가장 중요한 것은 우리의 가이드라인이 테스트를 쉽게 업스트림할 수 있게 해야 한다는 점이다.
[blink-dev 메일링 리스트](https://groups.google.com/a/chromium.org/forum/#!forum/blink-dev)는
우리의 현재 가이드라인을 공동 테스트 저장소와 조화시키는 일을 기꺼이 도와줄 것이다.
***

### 테스트 유형

웹 테스트에는 선호도 순서대로 나열한 네 가지 큰 유형이 있다.

* *JavaScript 테스트*는 [xUnit 테스트](https://en.wikipedia.org/wiki/XUnit)의 웹 테스트 구현이다.
  이 테스트들은 JavaScript로 작성된 assertion을 포함하며, assertion이 true로 평가되면 통과한다.
* *참조 테스트(Reference Tests)*는 테스트 페이지와 참조 페이지를 렌더링하고, 픽셀 단위 비교에 따라
  두 렌더링이 동일하면 통과한다. 이 테스트는 JavaScript 테스트보다 견고성이 낮고, 디버깅하기 어렵고,
  훨씬 느리며, 페인트 코드를 테스트할 때처럼 JavaScript 테스트로 충분하지 않은 경우에만 사용된다.
* *픽셀 테스트(Pixel Tests)*는 테스트 페이지를 렌더링하고 그 결과를 저장소에 있는 사전 렌더링된
  기준 이미지와 비교한다. 픽셀 테스트는 앞의 두 유형보다 견고성이 낮다. 페이지 렌더링은 호스트 컴퓨터의
  그래픽 카드와 드라이버, 플랫폼의 텍스트 렌더링 시스템, 사용자가 구성할 수 있는 다양한 운영체제 설정 등
  많은 요인의 영향을 받기 때문이다. 이러한 이유로 픽셀 테스트는 Blink가 테스트되는 각 플랫폼마다
  서로 다른 참조 이미지를 갖는 것이 일반적이며, 참조 이미지는
  [관리하기 꽤 번거롭다](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_expectations.md). 참조 테스트를 사용할 수 없는 경우에만
  픽셀 테스트를 작성해야 한다.
* *텍스트 테스트(Text Tests)*는 DOM 트리, DOM 내부 텍스트, 레이아웃 트리나 그래픽 레이어 트리 같은
  Blink의 내부 데이터 구조, 또는 테스트가 출력하려는 임의의 사용자 정의 텍스트를 나타내는 순수 텍스트를
  출력한다. 출력이 저장소의 기준 텍스트 파일과 일치하면 테스트가 통과한다. 내부 데이터 구조를 출력하는
  텍스트 테스트는 구현 내부의 특이한 동작을 테스트하기 위한 최후의 수단으로 사용되며, 다른 옵션 중 하나를
  사용하는 편이 좋으므로 피해야 한다.
* *오디오 테스트*는 오디오 결과를 출력한다.

*** aside
JavaScript 테스트는 실제로는 특수한 종류의 텍스트 테스트지만, 텍스트 기준선은 종종 생략할 수 있다.
***

*** aside
하나의 테스트가 동시에 참조/픽셀 테스트이면서 텍스트 테스트일 수 있다.
***

## 일반 원칙

테스트는 WPT 프로젝트로 업스트림될 것이라는 가정하에 작성해야 한다. 이를 위해 테스트는
[WPT 가이드라인](https://web-platform-tests.org/writing-tests/)을 따라야 한다.

모든 웹 테스트에 적용되는 스타일 가이드는 없다. 하지만 일부 프로젝트는
[ServiceWorker Tests Style guide](https://www.chromium.org/blink/serviceworker/testing) 같은
스타일 가이드를 채택했다.

우리의 [웹 테스트 팁 문서](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_tips.md)는 가장 중요한 WPT 가이드라인을 요약하고,
기존 테스트에서 스타일 규칙을 추론하려 할 때 주의할 만한 몇 가지 JavaScript 개념을 강조한다.
특별한 선호가 없고 따를 스타일 가이드를 찾고 있다면, 이 문서는 몇 가지 기본값도 제안한다.

## JavaScript 테스트

가능하면 테스트 기준은 JavaScript로 표현해야 한다. 이후 섹션에서 설명할 대안들은 더 느리고
덜 신뢰할 수 있는 테스트를 낳는다.

모든 새 JavaScript 테스트는 [testharness.js](https://github.com/web-platform-tests/wpt/tree/master/resources)
테스트 프레임워크를 사용해 작성해야 한다. 이 프레임워크는 다른 모든 브라우저 벤더와 공유되는
[web-platform-tests](https://github.com/web-platform-tests/wpt) 저장소의 테스트에서 사용되므로,
`testharness.js` 테스트는 브라우저 개발자들이 더 쉽게 접근할 수 있다.

`testharness.js`에 대한 자세한 소개는 [API 문서](https://web-platform-tests.org/writing-tests/testharness-api.html)를
참조하라.

웹 테스트는 위 문서의 권장사항을 따라야 한다. 또한 웹 테스트는 관련
[메타데이터](https://web-platform-tests.org/writing-tests/css-metadata.html)를 포함해야 한다.
명세 URL(`<link rel="help">` 안)은 거의 항상 관련이 있으며, 테스트를 빠르게 이해해야 하는 개발자에게
매우 큰 도움이 된다.

아래는 HTML 페이지에 포함된 JavaScript 테스트의 뼈대이다. 최소성 가이드라인을 따르기 위해,
HTML 파서가 추론할 수 있는 `<html>`, `<head>`, `<body>` 태그를 생략했다는 점에 유의하라.

```html
<!doctype html>
<title>JavaScript: the true literal is immutable and equal to itself</title>
<link rel="help" href="https://tc39.github.io/ecma262/#sec-boolean-literals">
<script src="/resources/testharness.js"></script>
<script src="/resources/testharnessreport.js"></script>
<script>
'use strict';

// Synchronous test example.
test(() => {
  const value = true;
  assert_true(value, 'true literal');
  assert_equals(value.toString(), 'true', 'the string representation of true');
}, 'The literal true in a synchronous test case');

// Asynchronous test example.
async_test(t => {
  const originallyTrue = true;
  setTimeout(t.step_func_done(() => {
    assert_equals(originallyTrue, true);
  }), 0);
}, 'The literal true in a setTimeout callback');

// Promise test example.
promise_test(() => {
  return new Promise((resolve, reject) => {
    resolve(true);
  }).then(value => {
    assert_true(value);
  });
}, 'The literal true used to resolve a Promise');

</script>
```

예제에서 즉시 명확하게 드러나지 않는 몇 가지 사항은 다음과 같다.

* 두 값을 비교하는 `assert_` 함수를 호출할 때, 첫 번째 인자는 실제 값(테스트 중인 기능이 생성한 값)이고,
  두 번째 인자는 기대 값(알려진 정상 값, golden)이다. 순서가 중요하다. 테스트 하니스가 테스트 실패를
  디버깅할 때 의존하는 표현력 있는 오류 메시지를 생성하기 위해 이 순서에 의존하기 때문이다.
* assertion 설명(`assert_` 메서드의 문자열 인자)은 실제 값을 얻은 방식을 전달한다.
    * 기대 값만으로 명확하지 않다면, assertion 설명은 원하는 동작을 설명해야 한다.
    * assertion이 하나뿐인 테스트 케이스는 충분히 명확하다면 assertion 설명을 생략해야 한다.
* 각 테스트 케이스는 중복 없이 자신이 테스트하는 상황을 설명한다.
    * 테스트 케이스 설명을 "Testing"이나 "Test for" 같은 중복된 용어로 시작하지 말라.
    * 테스트 케이스가 하나뿐인 테스트 파일은 테스트 케이스 설명을 생략해야 한다. 파일의 `<title>`만으로도
      테스트되는 시나리오를 설명하기에 충분해야 한다.
* 비동기 테스트에는 몇 가지 미묘한 점이 있다.
    * `async_test` 래퍼는 테스트 케이스가 완료되었음을 알리고 assertion 실패를 올바른 테스트에 연결하기 위해
      사용되는 테스트 케이스 인자로 함수를 호출한다.
    * 모든 테스트 케이스의 assertion이 실행된 뒤 `t.done()`을 호출해야 한다.
    * 테스트 케이스 assertion(실제로는 예외를 던질 수 있는 모든 콜백 코드)은 `t.step_func()` 호출로 감싸야 한다.
      그래야 assertion 실패와 예외를 올바른 테스트 케이스로 추적할 수 있다.
    * `t.step_func_done()`은 `t.step_func()`와 `t.done()` 호출을 결합한 단축 방식이다.

*** promo
`file://` origin에서 로드되는 웹 테스트는 현재
[/resources/testharness.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/testharness.js)와
[/resources/testharnessreport.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/testharnessreport.js)를
가리키기 위해 상대 경로를 사용해야 한다. 이는 절대 경로를 요구하는 WPT 가이드라인과 반대된다.
이 제한은 HTTP 서버에 의존하는 `web_tests/http`의 테스트나,
[WPT 저장소](https://github.com/web-platform-tests/wpt)에서 가져온 `web_tests/external/wpt`의 테스트에는
적용되지 않는다.
***

### WPT 보조 테스트 API

일부 테스트는 Web Platform API만으로 표현할 수 없다. 예를 들어 마우스 클릭 같은 사용자 제스처 수행이
필요한 일부 테스트는 Web API로 구현할 수 없다. WPT 프로젝트는 보조 테스트 API를 통해 이러한 경우 중
일부를 커버한다.

보조 테스트 API에 의존하는 테스트를 작성할 때는, 테스트 API가 없을 때 테스트가
[수동 테스트로 우아하게 저하](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_with_manual_fallback.md)되도록 하는 비용과 이점을 고려해 달라.

*** promo
많은 경우 사용자 제스처는 실제로 필요하지 않다. 예를 들어 많은 이벤트 처리 테스트는
[합성 이벤트](https://developer.mozilla.org/docs/Web/Guide/Events/Creating_and_triggering_events)를 사용할 수 있다.
***

### Blink 전용 테스트 API에 의존하기

Web Platform API나 WPT의 테스트 API로 표현할 수 없는 테스트는 Blink 전용 테스트 API를 사용한다.
이 API들은 [content_shell](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests_in_content_shell.md)에서만 사용할 수 있으며, 최후의 수단으로만
사용해야 한다.

Blink 전용 API의 단점은 Web Platform 기능만큼 문서화가 잘 되어 있지 않다는 점이다. Blink 전용 기능을
사용하는 법을 배우려면 그 기능을 사용하는 다른 테스트를 찾거나 소스 코드를 읽어야 한다.

예를 들어 가장 널리 쓰이는 Blink 전용 API는 `testRunner`이며,
[content/web_test/renderer/test_runner.h](https://chromium.googlesource.com/chromium/src/+/main/content/web_test/renderer/test_runner.h)와
[content/web_test/renderer/test_runner.cc](https://chromium.googlesource.com/chromium/src/+/main/content/web_test/renderer/test_runner.cc)에 구현되어 있다.
`TestRunnerBindings::Install` 메서드를 훑어보면 testRunner API가 `.testRunner` 등의 객체로 제공된다는 것을
알 수 있다. `TestRunnerBindings::GetObjectTemplateBuilder` 메서드를 읽으면 `testRunner` 객체에서 사용할 수 있는
속성을 알 수 있다.

또 다른 널리 쓰이는 Blink 전용 API인 'internals'는
[third_party/blink/renderer/core/testing/internals.idl](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/testing/internals.idl)에
정의되어 있으며 Blink 내부에 더 직접적으로 접근할 수 있게 한다.

*** note
가능하다면 Blink 전용 테스트 API를 사용하는 테스트는 해당 API에 의존하지 않도록 작성해야 한다. 그래야
브라우저에서도 직접 동작할 수 있다. 테스트가 동작하기 위해 API가 필요하더라도, API를 사용하기 전에 여전히
해당 API가 사용 가능한지 확인해야 한다. API를 사용할 때는 `window.` 접두사를 생략하지만, `if` 문에서는
정규화된 이름을 사용해야 한다는 점에 유의하라.
```javascript
  if (window.testRunner)
    testRunner.waitUntilDone();
```
***

*** note
`testRunner`는 Web Platform API만 사용하는 테스트에서도 간접적으로 사용되기 때문에 가장 널리 쓰이는 테스트 API이다.
`testharness.js`의 `testharnessreport.js` 파일은 `testharness.js`를 테스트 환경에 연결하는 글루 코드를 담도록
특별히 지정되어 있다. 우리의 구현은
[third_party/blink/web_tests/resources/testharnessreport.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/testharnessreport.js)에
있으며 `testRunner` API를 사용한다.
***

다른 유용한 API는 [content/web_test/renderer/](https://chromium.googlesource.com/chromium/src/+/main/content/web_test/renderer/) 디렉터리와
[WebKit의 LayoutTests 가이드](https://trac.webkit.org/wiki/Writing%20Layout%20Tests%20for%20DumpRenderTree)를
참조하라. 예를 들어 `eventSender`
([content/shell/renderer/web_test/event_sender.h](https://chromium.googlesource.com/chromium/src/+/main/content/web_test/renderer/event_sender.h)와
[content/shell/renderer/web_test/event_sender.cc](https://chromium.googlesource.com/chromium/src/+/main/content/web_test/renderer/event_sender.cc))에는
키보드/마우스 입력과 드래그 앤 드롭 같은 이벤트 입력을 시뮬레이션하는 메서드가 있다.

다음은 `testRunner` 바인딩이 Chromium에 어떻게 들어맞는지 보여주는 UML 다이어그램이다.

[![플랫폼 구현을 구성하는 testRunner 바인딩의 UML](https://docs.google.com/drawings/u/1/d/1KNRNjlxK0Q3Tp8rKxuuM5mpWf4OJQZmvm9_kpwu_Wwg/export/svg?id=1KNRNjlxK0Q3Tp8rKxuuM5mpWf4OJQZmvm9_kpwu_Wwg&pageid=p)](https://docs.google.com/drawings/d/1KNRNjlxK0Q3Tp8rKxuuM5mpWf4OJQZmvm9_kpwu_Wwg/edit)

### 텍스트 테스트 기준선

기본적으로 `testharness.js`를 사용하는 파일의 모든 테스트 케이스는 통과할 것으로 기대된다. 하지만 어떤 경우에는
실패하는 테스트 케이스를 저장소에 추가하는 편을 선호한다. 그러면 실패 모드가 바뀔 때 알림을 받을 수 있기 때문이다
(예: 테스트가 잘못된 출력을 반환하는 대신 크래시하기 시작하는지 알고 싶은 경우). 이러한 상황에서 테스트 파일에는
테스트의 기대 출력을 담은 `-expected.txt` 파일인 기준선이 함께 제공된다.

기준선은 적절한 경우 [여기](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md)에 설명된 `run_web_tests.py`와
[rebaselining 도구](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_expectations.md)에 의해 자동으로 생성된다.

`testharness.js`의 텍스트 기준선은 피해야 한다. `testharness.js` 테스트에 텍스트 기준선이 연결되어 있다는 것은
대개 버그가 있음을 나타내기 때문이다. 이러한 이유로 텍스트 기준선을 추가하는 CL은 텍스트 기대값 제거를 추적하는
이슈에 대한 [crbug.com](https://crbug.com) 링크를 포함해야 한다.

* WPT로 업스트림될 테스트를 만들 때 Blink의 현재 동작이 테스트 중인 명세와 일치하지 않는다면 텍스트 기준선이 필요하다.
  기대값 제거를 추적하는 이슈를 만들고, CL 설명에 그 이슈를 링크해야 한다는 점을 기억하라.
* WPT로 업스트림될 수 없는 웹 테스트는 JavaScript로 원하는 동작을 문서화하고 텍스트 파일로 현재 동작을 문서화하기보다는,
  JavaScript를 사용해 Blink의 현재 동작을 문서화해야 한다.

*** promo
[기준선 fallback](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_test_baseline_fallback.md) 때문에, 플랫폼 기준선이 없다는 사실만으로 플랫폼별 전체 `PASS`
상태를 [표현](https://crbug.com/1324638)하지 못할 수 있다. 드문 경우지만 이런 상황에서는
`blink_tool.py rebaseline-cl`이 모든 하위 테스트가 통과하도록 의도되었음을 `run_web_tests.py`에 알리는
자리표시자 기준선을 생성한다.

```
This is a testharness.js-based test.
All subtests passed and are omitted for brevity.
See https://chromium.googlesource.com/chromium/src/+/HEAD/docs/testing/writing_web_tests.md#Text-Test-Baselines for details.
Harness: the test ran to completion.
```

모든 플랫폼이 전체 `PASS`가 되면 `blink_tool.py optimize-baselines`가 이러한 자리표시자 기준선을 자동으로 제거한다.
***

### js-test.js 레거시 하니스

*** promo
역사적인 이유로 오래된 테스트는 `js-test` 하니스를 사용해 작성되어 있다. 이 하니스는 **사용 중단(deprecated)**되었으며,
새 테스트에는 사용하면 안 된다.
***

오래된 테스트를 이해해야 한다면, 최고의 `js-test` 문서는
[third_party/blink/web_tests/resources/js-test.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/js-test.js)에 있는 구현 자체이다.

`js-test` 테스트는 Blink 전용 `testRunner` 테스트 API에 크게 의존한다. 간단히 말해 테스트는 페이지 콘텐츠를 덤프하고
텍스트 기준선(`-expected.txt` 파일)과 비교해야 함을 알리기 위해 `testRunner.dumpAsText()`를 호출한다. 그 결과
`js-test` 테스트에는 항상 텍스트 기준선이 함께 제공된다. 비동기 테스트는 테스트 도구에 완료 시점을 알리기 위해
`testRunner.waitUntilDone()`과 `testRunner.notifyDone()`도 사용한다.

### HTTP 서버를 사용하는 테스트

기본적으로 테스트는 `file:` URL을 통해 로드되는 것처럼 로드된다. 일부 웹 플랫폼 기능은 HTTP 또는 HTTPS를 통해 제공되는
테스트를 요구한다. 예를 들어 절대 경로(`src=/foo`)나 보안 프로토콜로 제한되는 기능이 그렇다.

HTTP 테스트는 `web_tests/http/tests`(또는 가상 변형) 아래에 있는 테스트이다. 이 테스트를 실행하려면 로컬에서 실행 중인
HTTP 서버(Apache)를 사용한다. 테스트는 HTTP의 경우 8000 및 8080 포트에서, HTTPS의 경우 8443 포트에서 제공된다.
`run_web_tests.py`를 사용해 테스트를 실행하면 서버가 자동으로 시작된다. 실패를 재현하거나 디버그하기 위해 서버를
수동으로 실행하려면 다음과 같이 한다.

```bash
cd src/third_party/blink/tools
./run_blink_httpd.py
```

웹 테스트는 `http://127.0.0.1:8000`에서 제공된다. 예를 들어
`http/tests/serviceworker/chromium/service-worker-allowed.html` 테스트를 실행하려면
`http://127.0.0.1:8000/serviceworker/chromium/service-worker-allowed.html`로 이동하라. 일부 테스트는 localhost 대신
127.0.0.1로 접속했을 때 다르게 동작하므로 127.0.0.1을 사용하라.

서버를 종료하려면 `run_blink_httpd.py`가 실행 중인 터미널에서 아무 키나 누르거나, Windows에서는 `taskkill` 또는
작업 관리자를, MacOS에서는 `killall` 또는 Activity Monitor를 사용하면 된다.

테스트 서버는 `web_tests/resources` 디렉터리에 대한 별칭을 설정한다. HTTP 테스트에서는 예를 들어
`src="/resources/testharness.js"`로 테스트 프레임워크에 접근할 수 있다.

TODO: 웹 테스트 실행에 사용할 수 있는 위치가 되면 [wptserve](http://wptserve.readthedocs.io/)를 문서화한다.

## 참조 테스트(Reftests)

참조 테스트(reftests라고도 함)는 테스트 페이지의 렌더링된 이미지와 참조 페이지의 렌더링된 이미지를 픽셀 단위로 비교한다.
대부분의 참조 테스트는 두 이미지가 일치하면 통과하지만, 두 이미지가 _일치하지 않을 때_ 테스트가 통과하도록 하는 것이
유용한 경우도 있다.

참조 테스트는 JavaScript 테스트보다 디버그하기 더 어렵고, 더 느린 경향도 있다. 따라서 JavaScript 테스트로 커버할 수 없는
기능에만 사용해야 한다.

새 참조 테스트는 [WPT reftests 가이드라인](https://web-platform-tests.org/writing-tests/reftests.html)을 따라야 한다.
가장 중요한 사항은 아래에 요약되어 있다.

* &#x1F6A7; 테스트 이미지를 참조 이미지와 일치할 때 통과시키는지, 일치하지 않을 때 통과시키는지에 따라 테스트 페이지는
  `<link rel="match">` 또는 `<link rel="mismatch">`를 사용해 참조 페이지를 선언한다.
* 참조 페이지는 테스트 중인 기능을 사용해서는 안 된다. 그렇지 않으면 테스트는 의미가 없다.
* 참조 페이지는 가능한 한 단순해야 하며, 고급 기능에 의존해서는 안 된다. 이상적으로 참조 페이지는 CSS 지원이 빈약한
  브라우저에서도 의도한 대로 렌더링되어야 한다.
* 참조 테스트는 자체 설명적이어야 한다.
* 참조 테스트에는 `testharness.js`를 포함하지 않는다.

&#x1F6A7; 우리의 테스트 인프라는 Blink가 상속한
[WebKit reftests](https://trac.webkit.org/wiki/Writing%20Reftests)를 위해 설계되었다. 그 결과는 아래에 요약되어 있다.

* 각 참조 페이지는 관련 테스트와 같은 디렉터리에 있어야 한다.
  `foo`라는 이름의 테스트 페이지가 있을 때(예: `foo.html` 또는 `foo.svg`),
    * 두 이미지가 일치할 때 테스트가 통과한다면 참조 페이지 이름은 `foo-expected`여야 한다
      (예: `foo-expected.html`).
    * 두 이미지가 _일치하지 않을 때_ 테스트가 통과한다면 참조 페이지 이름은 `foo-expected-mismatch`여야 한다
      (예: `foo-expected-mismatch.svg`).
* 여러 참조와 체인된 참조는 지원되지 않는다.

다음 예제는 [`<ol>`의 reversed 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol)에 대한 참조 테스트를
보여준다. 예제는 테스트 페이지 이름이 `ol-reversed.html`이라고 가정한다.

```html
<!doctype html>
<link rel="match" href="ol-reversed-expected.html">

<ol reversed>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ol>
```

참조 페이지는 `ol-reversed-expected.html`이라는 이름이어야 하며, 아래와 같다.

```html
<!doctype html>

<ol>
  <li value="3">A</li>
  <li value="2">B</li>
  <li value="1">C</li>
</ol>
```

*** promo
테스트의 참조 페이지를 가리키는 방법은 아직 유동적이며,
[blink-dev](https://groups.google.com/a/chromium.org/d/topic/blink-dev/XsR6PKRrS1E/discussion)에서 논의 중이다.
***

## 픽셀 테스트

어떤 `testRunner` API가 호출되어 이미지 결과를 억제하지 않는 한(예: `testRunner.dumpAsText()`, `testRunner.dumpAsLayout()`,
[텍스트 테스트](#텍스트-테스트) 참조), 테스트는 기본적으로 이미지 결과를 만든다. 테스트가 이미지 결과를 만들지만 참조 테스트가
아니라면 그 테스트는 **픽셀 테스트**이다. 이미지 결과는 테스트와 연결된 `-expected.png` 파일인 이미지 기준선과 비교되며,
픽셀 단위 비교에 따라 이미지 결과가 기준선과 동일하면 테스트가 통과한다.

픽셀 테스트도 위에 제시된 원칙을 따라야 한다. 픽셀 테스트는 *자체 설명적*이고 *크로스 플랫폼*인 테스트를 만들고자 하는
바람에 고유한 과제를 제기한다.
[WPT 렌더링 테스트 가이드라인](https://web-platform-tests.org/writing-tests/rendering.html)에는 유용한 지침이 들어 있다.
가장 관련 있는 조언은 아래와 같다.

* 가능하면 성공을 나타내기 위해 초록색 문단/페이지/사각형을 사용하라. 그것이 불가능하다면 원하는(통과) 결과에 대한
  텍스트 설명을 포함해 테스트가 자체 설명적이 되도록 하라.
* 오류를 강조할 때만 빨간색 또는 `FAIL`이라는 단어를 사용하라. 빨간색 자체를 테스트하는 경우에는 적용되지 않는다.
* &#x1F6A7; 플랫폼의 텍스트 렌더링 시스템이 도입하는 변동성을 줄이기 위해
  [Ahem 글꼴](https://www.w3.org/Style/CSS/Test/Fonts/Ahem/README)을 사용하라. 텍스트, 텍스트 흐름, 글꼴 선택,
  글꼴 fallback, 글꼴 기능 또는 기타 타이포그래피 정보를 테스트하는 경우에는 적용되지 않는다.

*** promo
픽셀 테스트의 이미지 결과 기본 크기는 800x600px이다. 테스트 페이지가 기본적으로 800x600px 뷰포트에서 렌더링되기 때문이다.
일반적으로 스크롤을 구체적으로 다루지 않는 픽셀 테스트는 스크롤바를 만들지 않고 800x600px 뷰포트 안에 들어맞아야 한다.
***

*** promo
픽셀 테스트에서 Ahem을 사용하라는 권장은
[blink-dev](https://groups.google.com/a/chromium.org/d/topic/blink-dev/XsR6PKRrS1E/discussion)에서 논의 중이다.
***

다음 스니펫은 웹 테스트에 Ahem 글꼴을 포함한다.

```html
<style>
body {
  font: 10px Ahem;
}
</style>
<script src="/resources/ahem.js"></script>
```

*** promo
`web_tests/http`와 `web_tests/external/wpt` 밖의 테스트는 현재
[/third_party/blink/web_tests/resources/ahem.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/ahem.js)에 대한
상대 경로를 사용해야 한다.
***

### 중간 출력의 프레임을 페인트, 래스터 또는 그려야 하는 테스트

웹 테스트는 실제로 테스트가 종료될 때까지 출력 프레임을 그리지 않는다. 페인트된 프레임을 생성해야 하는 테스트는
[third_party/blink/web_tests/resources/run-after-layout-and-paint.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/run-after-layout-and-paint.js)에
정의된 `runAfterLayoutAndPaint()`를 사용할 수 있다. 이 함수는 프레임을 올리는 장치를 실행한 뒤 전달된 콜백을 호출한다.
또한 페인트 invalidation 및 repaint 테스트 작성을 돕기 위한 라이브러리가
[third_party/blink/web_tests/paint/invalidation/resources/text-based-repaint.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/paint/invalidation/resources/text-based-repaint.js)에
있다.

### 스크롤 애니메이션 테스트

일부 웹 테스트는 가운데 클릭 자동 스크롤, fling 등과 같은 애니메이션이 제대로 수행되는지 확인해야 한다. 디스플레이
컴포지터 픽셀 덤프 모드(현재 표준)에서 테스트할 때, 테스트의 표준 동작은 시간을 절약하기 위해 래스터링 없이 동기적으로
합성하는 것이다. 하지만 애니메이션은 표면 활성화 시 실행되며, 이는 래스터화가 수행된 뒤에만 발생한다. 따라서 이러한
테스트에는 추가 설정이 필요하다. 이러한 테스트의 시작 부분 근처에서
[third_party/blink/web_tests/resources/compositor-controls.js](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/resources/compositor-controls.js)에
정의된 `setAnimationRequiresRaster()`를 호출하라. 그러면 테스트 중 전체 래스터화가 활성화된다.

## 텍스트 테스트

**텍스트 테스트**는 텍스트 결과를 출력한다. 결과는 테스트와 연결된 `-expected.txt` 파일인 텍스트 기준선과 비교되며,
텍스트 결과가 기준선과 동일하면 테스트가 통과한다. 테스트 러너가 텍스트를 출력하도록 지시하기 위해 어떤 `testRunner` API를
호출하기 전까지는 테스트가 기본적으로 텍스트 테스트가 아니다. 텍스트 테스트는 텍스트 결과가 어떤 종류의 정보를 나타내는지에
따라 분류할 수 있다.

### 레이아웃 트리 테스트

테스트가 `testRunner.dumpAsLayout()` 또는 `testRunner.dumpAsLayoutWithPixelResults()`를 호출하면, 텍스트 결과는 테스트 페이지
메인 프레임의 Blink [레이아웃 트리](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction)
(그 페이지에서는 render tree라고 부름)에 대한 텍스트 표현이 된다. `testRunner.dumpChildFrames()`를 사용하면 텍스트 결과에
자식 프레임의 레이아웃 트리도 포함된다.

픽셀 테스트와 마찬가지로 레이아웃 트리 테스트의 출력은 플랫폼별 세부사항에 의존할 수 있으므로, 레이아웃 트리 테스트는
종종 플랫폼별 기준선을 요구한다. 더 나아가 테스트가 명백히 레이아웃 트리 구조에 의존하기 때문에, 우리가 레이아웃 트리를
변경하면 결과가 여전히 올바른지, 테스트가 여전히 의미 있는지 확인하기 위해 각 레이아웃 트리 테스트를 rebaseline해야 한다.
사람들이 기존 기준선과 테스트를 업데이트하고 싶어 하지 않았기 때문에 레이아웃 트리 출력이 잘못 진술된(즉 틀린) 경우가
실제로 많다. 이는 정말 안타깝고 혼란스럽다.

이러한 이유로 레이아웃 트리 테스트는 레이아웃 트리를 보아야만 테스트할 수 있는 레이아웃 코드의 측면을 커버하는 데에만
**반드시** 사용해야 한다. 다른 테스트 유형의 어떤 조합도 레이아웃 트리 테스트보다 선호된다. 레이아웃 트리 테스트는
[WebKit에서 상속](https://webkit.org/blog/1456/layout-tests-practice/)되었으므로, 저장소에는 레이아웃 트리 테스트의
안타까운 예가 일부 있을 수 있다.

다음 페이지는 레이아웃 트리 테스트의 예이다.

```html
<!doctype html>
<style>
body { font: 10px Ahem; }
span::after {
  content: "pass";
  color: green;
}
</style>
<script src="/resources/ahem.js"></script>
<script>
  if (window.testRunner)
    testRunner.dumpAsLayout();
</script>
<p><span>Pass if a green PASS appears to the right: </span></p>
```

테스트 페이지는 아래 텍스트 결과를 생성한다.

```
layer at (0,0) size 800x600
  LayoutView at (0,0) size 800x600
layer at (0,0) size 800x30
  LayoutBlockFlow {HTML} at (0,0) size 800x30
    LayoutBlockFlow {BODY} at (8,10) size 784x10
      LayoutBlockFlow {P} at (0,0) size 784x10
        LayoutInline {SPAN} at (0,0) size 470x10
          LayoutText {#text} at (0,0) size 430x10
            text run at (0,0) width 430: "Pass if a green PASS appears to the right: "
          LayoutInline {<pseudo:after>} at (0,0) size 40x10 [color=#008000]
            LayoutTextFragment (anonymous) at (430,0) size 40x10
              text run at (430,0) width 40: "pass"
```

위 테스트 결과가 `<p>` 텍스트의 크기에 의존한다는 점에 주목하라. 테스트 페이지는 위에서 소개한 Ahem 글꼴을 사용하는데,
이 글꼴의 주요 설계 목표는 일관된 크로스 플랫폼 렌더링이다. 테스트가 다른 글꼴을 사용했다면 텍스트 기준선은 테스트
컴퓨터에 설치된 글꼴과 플랫폼의 글꼴 렌더링 시스템에 의존했을 것이다. 픽셀 테스트 가이드라인을 따르고 신뢰할 수 있는
레이아웃 트리 테스트를 작성해 달라!

WebKit의 레이아웃 트리는 WebKit 블로그의
[일련의 글](https://webkit.org/blog/114/webcore-rendering-i-the-basics/)에 설명되어 있다. 거기에 있는 개념 중 일부는
여전히 Blink의 레이아웃 트리에 적용된다.

### 텍스트 덤프 테스트

테스트에서 `testRunner.dumpAsText()` 또는 `testRunner.dumpAsTextWithPixelResults()`가 호출되면, 테스트는 테스트 대상 페이지의
메인 프레임 텍스트 내용을 덤프한다. `testRunner.dumpChildFrames()`를 사용하면 텍스트 결과에 자식 프레임의 텍스트 내용도
포함된다. 실제로 JavaScript 테스트는 특수한 종류의 텍스트 덤프 테스트이며, 텍스트 기준선을 종종 생략할 수 있다.

테스트는 `testRunner.setCustomTextOutput(string)`을 호출해 기본 텍스트 덤프를 재정의할 수 있다. 문자열 매개변수는 테스트가
출력하고자 하는 임의의 텍스트일 수 있다. [`internals` API](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/testing/internals.idl)는
`testRunner.setCustomTextOutput()`의 매개변수로 사용할 수 있는 내부 데이터 구조의 텍스트 표현을 얻는 메서드를 제공한다.

### 마크업 덤프 테스트

테스트가 `testRunner.dumpAsMarkup()`을 호출하면, 텍스트 결과는 테스트의 메인 프레임 DOM이 된다.
`testRunner.dumpChildFrames()`를 사용하면 텍스트 결과에 자식 프레임의 DOM도 포함된다.

## 오디오 테스트

테스트가 `testRunner.setAudioData(array_buffer)`를 호출하면 테스트는 오디오 결과를 만든다. 결과는 테스트와 연결된
`-expected.wav` 파일인 오디오 기준선과 비교되며, 오디오 결과가 기준선과 동일하면 테스트가 통과한다.

## 픽셀/참조 테스트이면서 텍스트 테스트인 테스트

테스트가 `testRunner.dumpAsTextWithPixelResults()` 또는 `testRunner.dumpAsLayoutWithPixelResults()`를 호출하면, 그 테스트는
픽셀/참조 테스트이면서 텍스트 테스트이다. 픽셀 결과와 텍스트 결과를 모두 출력한다.

픽셀/참조 테스트이면서 텍스트 테스트인 테스트에서는 픽셀 결과와 텍스트 결과가 모두 기준선과 비교되며, 각 결과가 해당
기준선과 일치하면 테스트가 통과한다.

많은 [페인트 invalidation 테스트](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/paint/invalidation)가 이 유형이다. 픽셀 결과
(`-expected.png` 또는 `-expected.html`과 비교됨)는 올바른 렌더링을 보장하고, 텍스트 결과(`-expected.txt`와 비교됨)는
올바른 컴포지팅 및 래스터 invalidation을 보장한다(예상치 못한 과잉 invalidation과 과소 invalidation 없이).

레이아웃 트리 테스트의 경우, 픽셀 테스트 및/또는 텍스트 테스트를 원하는지는 시각적 이미지, 그 이미지가 구성된 방식의
세부사항, 또는 둘 모두 중 무엇에 관심이 있는지에 달려 있다. 여러 레이아웃 트리가 동일한 픽셀 출력을 생성할 수 있으므로,
테스트에서 실제로 어떤 출력에 관심이 있는지 명확히 하는 것이 중요하다.

## 디렉터리 구조

[web_tests 디렉터리](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests)는 현재 엄격하고 공식적인 구조가 부족하다. 다음 디렉터리들은
특별한 의미를 가진다.

* `http/` 디렉터리는 HTTP 서버가 필요한 테스트를 호스팅한다(위 참조).
* 모든 디렉터리의 `resources/` 하위 디렉터리는 미디어 파일 같은 바이너리 파일과 여러 테스트 파일에서 공유되는 코드를
  포함한다.

*** note
일부 웹 테스트는 `resources/`에 있는 JavaScript 파일을 참조하는 최소 HTML 페이지로 구성된다. 새 테스트에는 이 패턴을
사용하지 말아 달라. 이는 최소성 원칙에 어긋나기 때문이다. JavaScript 및 CSS 파일은 최소 두 개 이상의 테스트 파일에서
공유되는 경우에만 `resources/`에 있어야 한다.
***
