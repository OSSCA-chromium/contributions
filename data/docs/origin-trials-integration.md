---
title: Origin Trials 통합
order: 32
group: 번역 · docs
description: 기능을 Origin Trials와 통합하는 방법
source_path: docs/origin_trials_integration.md
source_sha256: 05f2642fd702af5fd2ef75a5301f82ebf48a7ee6aa228b3c2670b74b9ed65f07
translation_status: full
---
> 이 문서는 **Integrating a feature with the Origin Trials framework**([`docs/origin_trials_integration.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/origin_trials_integration.md)) 문서의 한국어 전체 번역입니다.

[Origin Trials framework]를 통해 기능을 노출하려면 몇 가지 코드 변경이 필요하다.

*** note
**경고:** 이는 Blink에서 구현된 기능에만 사용할 수 있다.
***


## 코드 변경

*** promo
**참고:** origin trial 실행을 요청하기 전에 이러한 코드 변경을 랜딩할 수 있다.
이 코드 변경은 origin trial을 통해 기능을 제어할 수 있게 하지만, origin trial 승인이 필요하지는 않다. 프로세스에 대한 자세한 내용은 [Running an Origin Trial]을 참조하라.
***

### 1단계: Origin Trial을 위해 Blink에 Runtime Enabled Feature 추가

먼저 [`runtime_enabled_features.json5`]를 구성해야 한다. 아직 Blink의 [Runtime Enabled Feature] 플래그가 없다면 이 파일에 항목을 추가해야 한다.

항목의 다음 필드들이 관련 있다.

- `name`: runtime enabled feature의 이름. 예: `"MyFeature"`.
- `origin_trial_feature_name`: origin trial에서 사용할 runtime enabled feature의 이름. runtime feature 플래그, 즉 `name` 필드와 같을 수도 있고 다를 수도 있다. 결국 이 구성된 이름은 origin trials 개발자 콘솔에서 사용된다.
- `origin_trial_os`: trial 활성화를 허용할 플랫폼의 `[list]`를 지정한다. 목록 값은 대소문자를 구분하지 않지만, 정의된 `OS_<platform>` 매크로 중 하나와 일치해야 한다([`build_config.h`] 참조).
- `origin_trial_allows_third_party`: 서드파티 토큰이 올바르게 동작하도록 허용하려면 활성화해야 한다. 서드파티 매칭을 지원하려는 경우에만 true로 설정한다.
- `base_feature`: 값이 `"none"`이 아니면 `blink::features` 네임스페이스에 `base::Feature`를 생성한다. Origin Trial을 원격으로 제어하는 데 도움이 된다. [Blink Feature에서 `base::Feature` 인스턴스 생성]도 참조하라.

Origin Trial에만 한정되지 않는 항목:

- `status`: runtime enabled feature가 Blink에서 언제 활성화되는지 제어한다. [the Status table]도 참조하라.
- `base_feature_status`: `base_feature`가 정의한 `base::Feature`가 언제 활성화되는지 제어한다.

자세한 내용은 json5 파일 및 위에 링크된 문서에 설명되어 있다.

runtime enabled feature 플래그가 [C++에서 사용되는 경우](#1-c에서), `RuntimeEnabledFeatures::MyFeatureEnabled()`의 인수 없는 오버로드를 호출하는 모든 호출자를 `const FeatureContext*`를 받는 오버로드로 변경해야 한다. 여기에 `ExecutionContext`를 전달할 수 있다. 예를 들어 `ExecutionContext::From(ScriptState*)`를 사용한다.

#### 예시

RuntimeEnabledFeature 플래그 이름, trial 이름, `base::Feature`가 모두 같은 경우:

```json
{
  name: "MyFeature",  // Generates `RuntimeEnabledFeatures::MyFeatureEnabled()`
  origin_trial_feature_name: "MyFeature",
  status: "experimental",
  // No need to specify base_feature.
},
```

RuntimeEnabledFeature 플래그 이름, trial 이름, `base::Feature` 이름이 서로 다른 경우:

```json
{
  name: "MyFeature",
  origin_trial_feature_name: "MyFeatureTrial",
  base_feature: "MyBaseFeature",  // Generates blink::features::kMyBaseFeature
  status: "experimental",
},
```

특정 플랫폼으로 제한된 trial:

```json
{
  name: "MyFeature",
  origin_trial_feature_name: "MyFeature",
  origin_trial_os: ["android"],
  status: "experimental",
},
```

#### WebView 고려 사항

WebView는 `"android"` OS 타깃의 일부로 빌드되므로, Android에서 활성화된 trial을 WebView에서 제외하는 것은 불가능하다.

trial 대상 기능을 다른 Android 플랫폼과 함께 WebView에서도 활성화할 수 있다면, 이 방식이 선호된다.

그것이 가능하지 않은 상황에서는 [`aw_main_delegate.cc`]의 `AwMainDelegate::BasicStartupComplete()`에서 비활성화할 trial 이름을 값으로 하여 `embedder_support::kOriginTrialDisabledFeatures` 스위치를 추가함으로써 origin trial을 명시적으로 비활성화하는 것이 권장되는 해결책이다.

이를 수행하는 방법의 예시는 https://crrev.com/c/3733267 를 참조하라.

### 2단계: 접근 게이트 처리

구성이 완료되면 origin trial 뒤에서 기능 접근을 게이트하는 메커니즘이 두 가지 있다. 기능 구현에 적절하게 둘 중 하나 또는 둘 모두를 사용할 수 있다.

#### 1) C++에서

런타임에 기능을 노출하기 위해 Blink 코드에서 호출할 수 있는 네이티브 C++ 메서드:

```cpp
bool RuntimeEnabledFeatures::MyFeatureEnabled(ExecutionContext*)
```

*** note
**경고:** 기능 구현은 enabled 검사 결과를 영속화해서는 안 된다. 코드는 기능 접근을 게이트하기 위해 필요한 만큼 자주 단순히 `RuntimeEnabledFeatures::MyFeatureEnabled(ExecutionContext*)`를 호출해야 한다.
***

#### 2-1) Web IDL에서

JavaScript 메서드/속성/객체를 노출하고 숨기는 코드를 자동 생성하는 데 사용할 수 있는 IDL 속성 \[[RuntimeEnabled]\].

```cpp
[RuntimeEnabled=MyFeature]
partial interface Navigator {
     readonly attribute MyFeatureManager myFeature;
}
```

#### 2-2) CSS 속성

*** promo
**참고:** CSS 속성의 경우 [CSSStyleDeclaration]에서의 노출이 런타임에 처리되므로 IDL 파일을 편집할 필요가 없다.
***

origin trial로 새 CSS 속성에 대한 실험도 실행할 수 있다. 위와 같이 [`runtime_enabled_features.json5`]에서 기능을 구성한 다음 [`css_properties.json5`]로 이동한다. 파일에 설명된 대로, 방금 정의한 기능과 CSS 속성을 연결하기 위해 `runtime_flag`를 사용한다. 그러면 CSS 속성이 runtime feature에 정의된 origin trial에 자동으로 연결된다. trial이 활성화되면 JavaScript(`Element.style`)와 CSS(`@supports` 포함) 양쪽에서 사용할 수 있게 된다.

*** promo
**예시:** [origin-trial-test-property]는 runtime feature `OriginTrialsSampleAPI`를 통해 제어되고 이어서 `Frobulate`라는 origin trial로 제어되는 테스트 CSS 속성을 정의한다.
***

*** note
**이슈:** 드문 경우지만 CSS style declaration 이후에 origin trial 토큰이 스크립트를 통해 추가되면 CSS 속성은 활성화되어 완전히 동작하지만 [CSSStyleDeclaration] 인터페이스에는 나타나지 않는다. 즉, `Element.style`에서 접근할 수 없다. 이 이슈는 crbug/1041993에서 추적된다.
***

### 3단계: Runtime Enabled Feature를 `base::Feature`에 매핑하기(선택 사항)

다음 예시가 있다고 하자.

```json
{
  name: "MyFeature",
  origin_trial_feature_name: "MyFeature",
  base_feature: "MyFeature",
  status: "experimental",
},
```

```cpp
[RuntimeEnabled=MyFeature]
interface MyFeatureAPI {
  readonly attribute bool dummy;
}
```

```cpp
// third_party/blink/.../my_feature_api.cc
bool MyFeatureAPI::ConnectToBrowser() {
  if (base::FeatureList::IsEnabled(blink::features::kMyFeature) {
    // Do something
  }
  return false;
}
```

위 예시는 새 기능이 runtime enabled feature 플래그 `MyFeature`에 더해 json 파일의 `base_feature` 정의에서 생성된 `base::Feature`, 예를 들어 `blink::features::kMyFeature`에 의존하는 경우를 보여준다.
하지만 둘의 값은 연결되어 있지 않다.

또한 [제한 사항](#제한-사항) 때문에 runtime enabled feature 플래그는 브라우저 프로세스에서 **기본적으로** 사용할 수 없다.

> 브라우저 프로세스에서 기능을 활성화해야 하는지 알아야 한다면,
> 렌더러가 런타임에 이를 알려주게 하거나,
> 아니면 항상 활성화되어 있다고 가정하고 렌더러에서 기능 접근을 게이트해야 한다.

*** note
**요약:** `MyFeature`를 켜도 `blink::features::kMyFeature`가 자동으로 켜지지 않으며, 그 반대도 마찬가지다.
***

이 문제를 완화하기 위한 몇 가지 옵션이 있다.

#### 옵션 1: `base::Feature`를 완전히 활성화하기. 예: `kMyFeature`

그리고 위 인용문에서 제안한 것처럼 Origin Trial이 기능(runtime enabled feature 플래그 `blink::features::MyFeature`를 통해)을 언제 사용할 수 있는지 결정하게 한다. `base::Feature`는 원격 Finch 구성으로 활성화하거나 C++의 기본값을 업데이트하여 활성화할 수 있다.

하지만 Origin Trial이 종료된 뒤에는, `MyFeature`가 제어하는 부분을 독립적으로 활성화할 수 없다면 Finch로 기능을 점진적으로 확대하는 것이 불가능해진다. 예를 들어 새로운 Web API `MyFeatureAPI`가 있는 경우, `MyFeature`를 활성화하면 Blink/브라우저 구현 없이 IDL만 모든 사람에게 제공될 수 있다.

*** note
**예시 버그:** https://crbug.com/1360678.
***

#### 옵션 2: 커스텀 매핑 설정하기

1. `MyFeature`가 `blink::features::kMyFeature`에 의존하게 하여 `features::kMyFeatures`가 활성화되어 있지 않으면 기능이 활성화되지 않게 한다. [third_party/blink/renderer/core/origin_trials/origin_trial_context.cc](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/origin_trials/origin_trial_context.cc)에서:

    ```cpp
    bool OriginTrialContext::CanEnableTrialFromName(const StringView& trial_name) {
      ...
      if (trial_name == "MyFeature") {
        return base::FeatureList::IsEnabled(blink::features::kMyFeatures);
      }
    }
    ```

2. 사용 사례를 처리하기 위해 `MyFeature`와 `blink::features::kMyFeature`의 커스텀 관계를 추가한다.

    먼저 [**기능이 어떻게 초기화되는지 결정하기: base::Feature 상태에 의존**](https://chromium.googlesource.com/chromium/src/+/main/docs/initialize_blink_features.md#step-2_determine-how-your-feature-is-initialized)을 읽어라. 거기에 설명된 매핑이 사용 사례에 맞지 않는다면 다음 예시를 참조하라.

    [content/child/runtime_features.cc](https://source.chromium.org/chromium/chromium/src/+/main:content/child/runtime_features.cc)에서:

    ```cpp
    void SetCustomizedRuntimeFeaturesFromCombinedArgs(
        const base::CommandLine& command_line) {
      // Example 1: https://bit.ly/configuring-trust-tokens
      // Example 2: https://crrev.com/c/3878922/14/content/child/runtime_features.cc
    }
    ```

### 4단계: Web Feature 카운팅

기능이 만들어지면 origin trial을 실행하기 위해 사용자가 기능을 얼마나 자주 사용하는지 추적해야 한다. 두 가지 방식으로 할 수 있다.

#### C++ 코드에서 카운터 증가시키기

1. 기능 카운터를 [`webdx_feature.mojom`] 끝에 추가한다(또는 [web platform dx repository](https://github.com/web-platform-dx/web-features/)에 설명될 것으로 예상되지 않는 기능이라면 [`web_feature.mojom`]에 추가한다)."

    ```cpp
    enum WebDXFeature {
      // ...
      kLastFeatureBeforeYours = 1235,
      // Here, increment the last feature count before yours by 1.
      kMyFeature = 1236,

      kNumberOfFeatures,  // This enum value must be last.
    };
    ```

2. [`update_use_counter_feature_enum.py`]를 실행하여 UMA 매핑을 업데이트한다.

3. C++ 코드에서 기능 카운터를 증가시킨다.

    ```cpp
    #include "third_party/blink/renderer/platform/instrumentation/use_counter.h"

    // ...

      if (RuntimeEnabledFeatures::MyFeatureEnabled(context)) {
        UseCounter::Count(context, WebFeature::kMyFeature);
      }
    ```

#### \[MeasureAs\] IDL 속성으로 카운터 업데이트하기

1. \[[MeasureAs="WebDXFeature::kMyFeature"]\] IDL 속성을 추가한다.

    ```cpp
    partial interface Navigator {
      [RuntimeEnabled=MyFeature, MeasureAs="WebDXFeature::kMyFeature"]
      readonly attribute MyFeatureManager myFeature;
    ```

   또는 기능 카운터가 WebDXFeature use counter에 맞지 않는다면 WebFeature로 만들고 위 \[[MeasureAs]\] 속성에서 WebDXFeature:: 접두사(및 따옴표)를 제거하거나, 대신 \[[Measure]\]를 사용하고 \[[Measure]\] IDL 속성 명명 규칙을 따른다.

2. use counter를 [`webdx_feature.mojom`]에 추가한다(또는 대안으로 [`web_feature.mojom`]에 추가한다). 기능 카운터를 증가시키는 코드는 V8 bindings 코드에서 자동으로 생성된다.

    ```cpp
    enum WebDXFeature {
      // ...
      kLastFeatureBeforeYours = 1235,
      // Here, increment the last feature count before yours by 1.
      kMyFeature = 1236,

      kNumberOfFeatures,  // This enum value must be last.
    };
    ```

### 5단계: Web Test 추가

\[[RuntimeEnabled]\] IDL 속성을 사용할 때는 V8 bindings 코드가 예상대로 동작하는지 확인하기 위해 web test를 추가해야 한다. 기능이 어떻게 노출되는지에 따라 노출된 인터페이스에 대한 테스트뿐 아니라 스크립트로 추가된 토큰에 대한 테스트도 필요하다. 예시는 [origin_trials/webexposed]의 기존 테스트를 참조하라.

## 제한 사항

이 origin trial의 특성 때문에 할 수 없는 것은, 현재 페이지/컨텍스트에서 기능이 사용될지 여부를 브라우저 또는 렌더러 시작 시점에 아는 것이다. 이는 시작하기 위해 많은 비용이 드는 처리가 필요한 경우(예를 들어 사용자의 하드 드라이브를 인덱싱하거나, 흥미로운 날씨 패턴을 찾기 위해 도시 전체를 스캔하는 경우) 혹시 사용될 수 있으므로 *모든* 사용자에 대해 브라우저 시작 시 수행하거나, 최초 접근 시 수행해야 함을 의미한다. (최초 접근 방식을 선택하면 실험을 시도하는 사람들만 지연을 느끼게 되며, 바라건대 처음 사용할 때만 느끼게 된다.) 우리는 `OriginTrials::myFeatureShouldInitialize()` 같은 메서드를 제공하는 방안을 조사하고 있다. 이 메서드는 시작 초기화를 해야 하는지 힌트를 줄 것이다. 예를 들어 사용량 때문에 철회되었거나 스로틀된 trial, 전체 origin trials 프레임워크가 비활성화되었는지 등에 대한 검사를 포함할 수 있다. 이 메서드는 보수적으로 동작하여 초기화가 필요하다고 가정하겠지만, 일부 알려진 시나리오에서는 비용이 큰 시작 작업을 피할 수 있다.

마찬가지로 브라우저 프로세스에서 기능을 활성화해야 하는지 알아야 한다면, 렌더러가 런타임에 이를 알려주게 하거나, 아니면 항상 활성화되어 있다고 가정하고 렌더러에서 기능 접근을 게이트해야 한다.

## 수동 테스트

개발 중 origin trial 기능을 테스트하려면 다음 단계를 따른다.

1. [`generate_token.py`]를 사용하여 테스트 private key로 서명된 토큰을 생성한다. 테스트를 돕기 위해 필요한 어떤 origin에 대해서도 서명된 토큰을 생성할 수 있으며, localhost 또는 127.0.0.1도 포함된다. 예:

    ```bash
    tools/origin_trials/generate_token.py http://localhost:8000 MyFeature
    ```

   서드파티 토큰을 생성하고, 만료 날짜를 설정하고, 다른 옵션을 제어하기 위한 추가 플래그가 있다. 자세한 내용은 명령 도움말(`--help`)을 참조하라. 예를 들어 [user subset exclusion]과 함께 서드파티 토큰을 생성하려면:

    ```bash
    tools/origin_trials/generate_token.py --is-third-party --usage-restriction=subset http://localhost:8000 MyFeature
    ```

2. 출력 끝에서 토큰을 복사하여 [Developer Guide]에 설명된 대로 `<meta>` 태그 또는 `Origin-Trial` 헤더에서 사용한다.

3. 다음을 전달하여 테스트 public key로 Chrome을 실행한다:
   `--origin-trial-public-key=dRCs+TocuKkocNKa0AtZ4awrt9XKH2SQCI6o4FY6BNA=`

다음을 전달하여 테스트 public key와 기본 public key를 함께 사용해 Chrome을 실행할 수도 있다:
`--origin-trial-public-key=dRCs+TocuKkocNKa0AtZ4awrt9XKH2SQCI6o4FY6BNA=,fMS4mpO6buLQ/QMd+zJmxzty/VQ6B1EUZqoCU04zoRU=`

*** promo
**팁:** Android용 Chrome에 명령줄 스위치를 적용하려면 [이 문서](https://www.chromium.org/developers/how-tos/run-chromium-with-flags/)를, Android WebView에 명령줄 스위치를 적용하려면 [이 문서](https://chromium.googlesource.com/chromium/src/+/main/android_webview/docs/commandline-flags.md)를 참조하라.
***

`content_shell`에서는 `--origin-trial-public-key` 스위치가 필요하지 않다. 기본적으로 테스트 public key를 사용하기 때문이다.

테스트 private key는 repo의 `tools/origin_trials/eftest.key`에 저장되어 있다. Origin Trials unit test와 web test에서도 사용된다.

명령줄 스위치를 설정할 수 없는 경우(예: Chrome OS)에는 [`chrome_origin_trial_policy.cc`]를 직접 수정할 수도 있다.

origin trial 토큰 파싱에 대한 추가 정보(실패 이유 또는 성공한 토큰의 토큰 이름 포함)를 보려면 다음 스위치를 추가할 수 있다.

  `--vmodule=trial_token=2,origin_trial_context=1`

`is_debug=false`로 빌드하는 경우에는 빌드 옵션에 `dcheck_always_on=true`도 추가해야 하며, 명령줄에 다음을 추가해야 한다.

  `--enable-logging=stderr`

## 관련 문서

- [Chromium Feature API & Finch (Googler-only)](http://go/finch-feature-api)
- [Configuration: Prefs, Settings, Features, Switches & Flags](https://chromium.googlesource.com/chromium/src/+/main/docs/configuration.md)
- [Runtime Enabled Features]
- [content layer에서 Blink runtime feature 초기화](https://chromium.googlesource.com/chromium/src/+/main/docs/initialize_blink_features.md)

[Origin Trials framework]: https://googlechrome.github.io/OriginTrials/developer-guide.html
[Runtime Enabled Feature]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md
[Runtime Enabled Features]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md
[Blink Feature에서 `base::Feature` 인스턴스 생성]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md#generate-a-instance-from-a-blink-feature
[the Status table]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md#adding-a-runtime-enabled-feature
[`build_config.h`]: https://chromium.googlesource.com/chromium/src/+/main/build/build_config.h
[`chrome_origin_trial_policy.cc`]: https://chromium.googlesource.com/chromium/src/+/main/chrome/common/origin_trials/chrome_origin_trial_policy.cc
[`generate_token.py`]: https://chromium.googlesource.com/chromium/src/+/main/tools/origin_trials/generate_token.py
[Developer Guide]: https://github.com/jpchase/OriginTrials/blob/gh-pages/developer-guide.md
[RuntimeEnabled]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/bindings/IDLExtendedAttributes.md#RuntimeEnabled
[origin_trials/webexposed]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/web_tests/http/tests/origin_trials/webexposed/
[`runtime_enabled_features.json5`]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/runtime_enabled_features.json5
[`webdx_feature.mojom`]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/public/mojom/use_counter/metrics/webdx_feature.mojom
[`web_feature.mojom`]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/public/mojom/use_counter/metrics/web_feature.mojom
[`update_use_counter_feature_enum.py`]: https://chromium.googlesource.com/chromium/src/+/main/tools/metrics/histograms/update_use_counter_feature_enum.py
[Measure]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/bindings/IDLExtendedAttributes.md#Measure
[`css_properties.json5`]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/css/css_properties.json5
[origin-trial-test-property]: https://chromium.googlesource.com/chromium/src/+/ff2ab8b89745602c8300322c2a0158e210178c7e/third_party/blink/renderer/core/css/css_properties.json5#2635
[CSSStyleDeclaration]: https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/css/css_style_declaration.idl
[Running an Origin Trial]: https://www.chromium.org/blink/origin-trials/running-an-origin-trial
[user subset exclusion]: https://docs.google.com/document/d/1xALH9W7rWmX0FpjudhDeS2TNTEOXuPn4Tlc9VmuPdHA/edit#heading=h.myaz1twlipw
[`aw_main_delegate.cc`]: https://chromium.googlesource.com/chromium/src/+/main/android_webview/lib/aw_main_delegate.cc
