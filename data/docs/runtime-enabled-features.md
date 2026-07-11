---
title: 런타임 활성화 기능
order: 42
group: 번역 · third_party/blink
description: Blink 런타임 기능 플래그 시스템
source_path: third_party/blink/renderer/platform/RuntimeEnabledFeatures.md
source_sha256: ''
translation_status: full
---
> 이 문서는 **Runtime Enabled Features**([`third_party/blink/renderer/platform/RuntimeEnabledFeatures.md`](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md)) 문서의 한국어 전체 번역입니다.

## 개요
런타임 플래그는 Blink가 새 기능에 대한 접근을 제어할 수 있게 한다. 런타임 플래그 뒤에 숨겨진 기능을 런타임 활성화 기능(Runtime Enabled Features)이라고 한다. 새로운 웹 노출 기능은 Intent To Ship이 승인될 때까지 런타임 플래그 뒤에서 구현해야 한다는 것이 Blink 출시 프로세스의 요구사항이다. 또한, 사소하지 않은 호환성 위험이 있는 모든 변경은 빠르게 비활성화할 수 있도록 런타임 활성화 기능(또는 다른 `base::Feature`)으로 [보호되어야 한다](https://chromium.googlesource.com/chromium/src/+/main/docs/flag_guarding_guidelines.md).

## 런타임 활성화 기능 추가하기
런타임 활성화 기능은 `runtime_enabled_features.json5`에 알파벳순으로 정의된다. 기능의 플래그를 [runtime_enabled_features.json5]에 추가하면 나머지는 자동으로 생성된다.

가능하다면 명세 또는 chromestatus.com 항목 링크를 포함해 설명적인 주석을 추가하라. 이렇게 하면 독자가 해당 기능에 대한 더 많은 맥락을 쉽게 찾을 수 있다.

예:
```js
{
  // 놀라운 새 기능! https://chromestatus.com/feature/123
  name: "AmazingNewFeature",
  status: "experimental",
}
```
기능의 상태는 Blink 엔진에서 언제 활성화될지를 제어한다.

| 상태 값 | content_shell을 사용하는 [웹 테스트] 중 웹 기능 활성화 [1] | 웹 실험 기능의 일부로 웹 기능 활성화 [2] | 안정 릴리스에서 웹 기능 활성화 | 명령줄 플래그를 통해 웹에 노출되지 않는 기능 활성화 [3]
|:---:|:---:|:---:|:---:|:---:|
| <missing\> | 아니요 | 아니요 | 아니요 | 예 |
| `test` | 예 | 아니요 | 아니요 | 아니요 |
| `experimental` | 예 | 예 | 아니요 | 아니요 |
| `stable` | 예 | 예 | 예 | 아니요 |

\[1]: `content_shell`은 기본적으로 experimental/test 기능을 활성화하지 않는다. 웹 테스트 실행의 일부로 사용되는 `--run-web-tests` 플래그가 이 동작을 활성화한다. `--enable-blink-test-features` 플래그도 Chromium 및 content_shell의 브라우저 모드에서 이 동작을 활성화한다.

\[2]: URL 표시줄에서 `about:flags`로 이동해 “Enable experimental web platform features”(이전 명칭: “Enable experimental WebKit features”)를 켜거나, `--enable-experimental-web-platform-features`(이전 명칭: `--enable-experimental-webkit-features`)를 사용해 Chromium을 실행한다.
모든 Chromium 채널(canary, dev, beta, stable)에서 동작한다.

\[3]: 웹 노출 기능은 아니지만 Blink 안의 코드가 트리거되어야 하는 기능을 위한 것이다. 이런 기능은 `about:flags` 항목을 가질 수 있거나 다른 신호에 기반해 토글될 수 있다. 이런 항목은 중단된 항목과 구분되도록 주석에서 명시해야 한다.

### 플랫폼별 기능 상태
모든 플랫폼에서 동일한 상태를 갖지 않는 기능의 경우, 딕셔너리 값을 사용해 상태를 지정할 수 있다.

예를 들어 아래 선언에서는:
```js
{
  name: "NewFeature",
  status: {
    "Android": "test",
    "ChromeOS": "experimental",
    "Win": "stable",
    "default": "",
  }
}
```
이 기능은 Android에서 `test`, Chrome OS에서 `experimental`, Windows에서 `stable` 상태를 가지며, 다른 플랫폼에서는 상태가 없다.
지정되지 않은 모든 플랫폼의 상태는 `default` 키를 사용해 설정된다. 예를 들어 다음 선언은:
```js
status: {
  "Android": "stable",
  "default", "experimental",
}
```
Android를 제외한 모든 플랫폼에서는 기능 상태를 `experimental`로 설정하고(Android에서는 `stable`로 설정), Android에서는 `stable`로 설정한다.

**참고:** 상태 딕셔너리에서 `default`를 생략하면 `"default": ""`라고 작성한 것과 동일하게 처리된다.

**참고:** 지원되는 모든 플랫폼 목록은 [runtime_enabled_features.json5 status declaration][supportedPlatforms]에서 찾을 수 있다.

### 기능 상태 설정 지침
개발 중인 기능은 상태 없이 추가할 수 있으며, 유일한 요구사항은 코드 OWNERS가 그 코드가 트리에 랜딩되는 것을 허용할 의사가 있어야 한다는 점이다(다른 모든 커밋과 동일).

* 기능을 `status: "test"`로 표시하려면 내부 테스트를 허용할 만큼 충분한 상태여야 한다. 예를 들어 기능을 활성화했을 때 쉽게 크래시를 일으키거나, 메모리를 누수하거나, 봇의 신뢰성에 그 밖의 방식으로 유의미한 영향을 준다고 알려져 있어서는 안 된다. 출시 중인 동작에 대한 테스트 커버리지가 손실될 가능성도 고려해야 한다. 예를 들어 기능 때문에 기존 코드 경로 대신 새 코드 경로가 사용된다면, 기능을 `status: "test"`로 설정함으로써 가치 있는 테스트 커버리지와 회귀 방지가 일부 손실될 수 있다. 특히 출시된 제품과 상당히 다른 코드 경로를 가진 기능에 `status: "test"`를 사용하는 것은 강하게 권장되지 않는다. 예전 코드 경로와 새 코드 경로를 모두 계속 테스트하는 것이 중요하다면 [가상 테스트 스위트]를 사용하거나 [플래그별] [trybot(예시)]를 설정하는 것을 고려하라. [LayoutNG]와 [BlinkGenPropertyTrees]는 `status: "test"`를 사용하지 않고도 완전히 출시될 때까지 새 코드 경로와 예전 코드 경로 모두의 테스트 커버리지를 보장했던 기능의 예다. 이를 어떻게 달성했는지는 링크된 문서/버그를 참조하라.

* 기능을 `status: "experimental"`로 표시하려면 얼리어답터 웹 개발자의 테스트를 허용할 만큼 충분히 진행되어 있어야 한다. 많은 Chromium 애호가가 `--enable-experimental-web-platform-features`를 켜고 실행하므로, 기능을 experimental 상태로 승격하는 것은 안정성 또는 호환성 문제에 대한 조기 경고를 얻는 좋은 방법이 될 수 있다. 그런 문제가 발견되면(예: 기능이 활성화되었을 때 주요 웹사이트가 심각하게 망가지는 경우), 그런 사용자에게 부당한 문제를 만들지 않도록 기능을 상태 없음 또는 `status: "test"`로 다시 강등해야 한다. 이 플래그를 활성화했다는 사실을 언급하지 않는 사용자의 버그 리포트를 진단하는 일은 악명 높게 어렵다. 종종 기능은 구현이 완료되기 훨씬 전, API 설계에 아직 상당한 변동이 있는 동안 experimental 상태로 설정된다. 이 상태의 기능은 완전하게 동작할 것으로 기대되지 않으며, 개발자가 피드백을 제공하고 싶어 할 만한 가치 있는 무언가를 하기만 하면 된다.

   **참고:** “experimental”로 설정된 기능은 기존 주요 사이트에 심각한 파손을 일으킬 것으로 예상되어서는 **안 된다**. 주된 사용 사례는 호환성 문제를 일으킬 것으로 예상되지 않는 새 API 또는 기능이다. 기능이 합리적으로 호환성 문제를 일으킬 수 있다고 예상된다면, 상태 없음 또는 `status:"test"`로 표시된 상태를 유지하라 [4].

\[4]: 이 경우 기능이 비활성화된 코드 경로의 테스트 커버리지를 보장할 수 없는 한, `status:"test"`보다 “상태 없음”이 선호된다. 자세한 내용은 `status:"test"` 섹션을 참조하라.

* 기능을 `status: "stable"`로 표시하려면 완성되어 모든 Chrome 사용자가 사용할 준비가 되어 있어야 한다. 대개 이는 [Blink 출시 프로세스]를 통해 승인을 받았다는 뜻이다. 그러나 웹에서 관찰할 수 없는 기능(예: 대규모 코드 리팩터링을 추적하기 위한 플래그)의 경우 이 승인은 필요하지 않다. 드문 경우 기능을 일시적으로 `status: "stable"`로 설정해 canary 및 dev 채널에서 테스트할 수 있는데, 이때 beta 브랜치 전까지 해당 기능을 다시 `status: "experimental"`로 설정하는 것을 추적하는 `Release-Block-Beta` 표시 버그를 가리키는 주석이 있어야 한다.

기능이 출시되었고 더 이상 비활성화할 필요가 생길 위험이 없다면, 관련 RuntimeEnableFeatures 항목은 완전히 제거해야 한다. 영구 기능에는 일반적으로 플래그가 없어야 한다.

기능이 stable이 아니며 더 이상 활발히 개발되고 있지 않다면, 그 기능의 `status: "test"/"experimental"`을 제거하라(그리고 해당 기능을 구현한 코드를 삭제하는 것도 고려하라).

### Blink 기능과 Chromium 기능

기본적으로 `runtime_enabled_features.json5`의 Blink 기능 항목은 같은 이름의 대응되는 Chromium `base::Feature` 인스턴스를 기본적으로 `blink::features` 네임스페이스에 자동 생성한다.

이는 Finch 구성에서 기능을 제어하고, Blink 외부의 Chromium 코드에서 기능 상태를 확인하는 데 유용하다.
이 기능은 명령줄에서 `--enable-features=` 및 `--disable-features=`를 사용해 활성화하거나 비활성화할 수 있다.

다른 이름의 `base::Feature`를 생성하고 싶다면 `base_feature: "AnotherFlagName"`을 지정하라.

`base::Feature` 생성을 비활성화하려면 `base_feature: "none"`을 지정하라.
이는 Finch “kill switch”를 통해 기능을 비활성화하지 못하게 하므로 강하게 권장되지 않는다.

생성된 `base::Feature`는 Blink 기능의 상태가 `stable`이면 기본적으로 활성화되고, 그렇지 않으면 기본적으로 비활성화된다. 이 동작은 `base_feature_status` 필드로 재정의할 수 있다.

`runtime_enabled_features.json5`의 기능 항목에 `public: true,`를 추가하면 `WebRuntimeFeatures`의 전용 메서드를 사용해 Blink 외부에서 Blink 기능 상태를 갱신하거나 확인할 수도 있다. 이는 드물게만 필요해야 한다.

**참고:** 개발자에게 보이는 플랫폼 변경을 Finch로 점진적 출시하는 것은 권장되지 않는다.
[플랫폼 변경에는 waterfall 출시를 선호하라.](https://chromium.googlesource.com/chromium/src/+/main/docs/flag_guarding_guidelines.md#Prefer-waterfall-rollout-for-platform-changes)

### Origin Trial 기능과 base::Feature

기능이 origin trial로 제어되고 Blink 외부(예: 브라우저 프로세스)에서 그 상태에 접근해야 한다면, 대응되는 `base::Feature`가 필요하다.

기본적으로 `base::Feature` 상태는 Blink 기능에 동기화된다. origin trial의 경우 이것은 문제가 된다. origin trial 토큰은 Blink 기능만 제어하므로, 브라우저 프로세스가 기능 실행을 차단하지 않도록 Chromium 쪽 `base::Feature`는 기본적으로 활성화되어야 한다. 그러나 `base::Feature`가 기본적으로 활성화되면 Blink 기능도 기본적으로 활성화되어 origin trial 토큰 검사를 완전히 우회하게 된다!

이를 해결하려면 `base_feature_status: "enabled"`를 `copied_from_base_feature_if: "overridden"`와 함께 사용하라.

예:
```js
{
  name: "MyAmazingTrialFeature",
  origin_trial_feature_name: "MyAmazingTrialFeature",
  status: "experimental",
  base_feature_status: "enabled",
  copied_from_base_feature_if: "overridden",
}
```

이 구성은 다음을 달성한다:
1. **Chromium(브라우저 프로세스):** `base::Feature`가 기본적으로 활성화되어 브라우저 쪽 로직이 실행될 수 있다(또는 Blink로부터의 IPC에 의존할 수 있다).
2. **Blink(렌더러 프로세스):** `copied_from_base_feature_if`가 `"overridden"`로 설정되어 있으므로, `base::Feature`의 `"enabled"` 기본 상태가 Blink 기능으로 복사되지 **않는다**. Blink 기능은 기본적으로 비활성 상태로 남아, 페이지에서 기능을 활성화하려면 origin trial 토큰이 엄격히 필요함을 보장한다.
3. **Kill Switch:** 치명적인 버그가 발견되면 Finch 또는 명령줄(`--disable-features=MyAmazingTrialFeature`)을 통해 기능을 여전히 완전히 비활성화할 수 있다. `base::Feature`가 명시적으로 비활성 상태로 재정의되므로 `"overridden"` 조건이 충족되고, Blink 기능도 origin trial을 재정의하면서 강제로 비활성화된다.

#### 기능 상태 확인하기

`base::Feature`가 기본적으로 활성화되어 있으므로, 그 상태를 직접 확인하면 거의 항상 true를 반환한다. 기능 상태를 확인하는 방식에 주의해야 한다:

* **Blink(렌더러)에서:** 항상 `RuntimeEnabledFeatures::MyAmazingTrialFeatureEnabled(execution_context)`를 사용하라. 이는 kill switch, 전역 Blink 플래그, 그리고 주어진 컨텍스트에 유효한 origin trial 토큰의 존재를 올바르게 평가한다. `base::FeatureList::IsEnabled()`를 사용하지 **말라**.
* **Chromium(브라우저 프로세스)에서:** `base::FeatureList::IsEnabled(blink::features::kMyAmazingTrialFeature)`는 기본적으로 `true`를 반환한다. 이는 기능이 실행될 수 *허용*되어 있는지(즉, kill-switch되지 않았는지)만 알려준다. 특정 페이지에서 origin trial이 활성 상태인지는 알려주지 **않는다**. 브라우저 프로세스에서 페이지별 origin trial 상태를 확인하려면 `browser_process_read_access: true`를 사용하거나(상태를 `RuntimeFeatureStateReadContext`를 통해 노출함), 렌더러에서 오는 명시적 IPC에 의존해야 한다.
* **`public: true` 사용:** 기능에 `public: true`를 추가하면 `WebRuntimeFeatures::IsMyAmazingTrialFeatureEnabledByRuntimeFlag()`가 생성된다. `ByRuntimeFlag` 접미사에 유의하라. 이는 *전역* Blink 상태만 확인한다(예: 명령줄을 통해 강제로 켜졌는지). 페이지별 origin trial 토큰은 평가하지 **않는다**. 주로 프로세스 시작 중(예: `content/child/runtime_features.cc`) 브라우저 쪽 의존성이 누락된 경우 Blink 기능을 전역적으로 강제 비활성화하는 데 사용된다.

### 런타임 활성화 기능 사이의 의존성 도입

`implied_by`와 `depends_on` 매개변수는 다른 기능과의 관계를 지정하는 데 사용할 수 있다.

* `"implied_by"`: 이 필드를 지정하면, implied_by 기능 중 하나라도 활성화되어 있을 때 이 기능이 자동으로 활성화된다.

* `"depends_on"`: 이 필드를 지정하면, depends_on 기능이 모두 활성화되어 있을 때만 이 기능이 활성화된다.

**참고:** `implied_by`와 `depends_on` 중 하나만 지정할 수 있다.

### 런타임 활성화 CSS 속성

기능이 새 CSS 속성을 추가한다면 [renderer/core/css/css_properties.json5][cssProperties]에서 `runtime_flag` 인자를 사용해야 한다.

## 런타임 활성화 기능 사용하기

### C++ 소스 코드

#### 렌더러에서

다음 include를 추가하라:
```cpp
#include "third_party/blink/renderer/platform/runtime_enabled_features.h"
```
이 include는 기능이 활성화되어 있는지 확인/설정하기 위한 다음 정적 메서드를 제공한다:
```cpp
bool RuntimeEnabledFeatures::AmazingNewFeatureEnabled();
void RuntimeEnabledFeatures::SetAmazingNewFeatureEnabled(bool enabled);
```
**참고:** MethodNames와 FeatureNames는 UpperCamelCase를 사용한다. 이는 코드 생성기에서 자동으로 처리되며, 기능의 플래그 이름이 “CSS”, “IME”, “HTML” 같은 약어로 시작하더라도 동작한다.
예를 들어 “CSSMagicFeature”는 `RuntimeEnabledFeatures::CSSMagicFeatureEnabled()`와 `RuntimeEnabledFeatures::SetCSSMagicFeatureEnabled(bool)`가 된다.

#### 브라우저 프로세스에서

브라우저 프로세스에서 이 기능이 켜져 있는지 알아야 한다면, 기능이 `browser_process_read_access` 또는 `browser_process_read_write_access`를 true로 설정했는지 확인하라.
이 중 적어도 하나가 없으면 필요한 코드가 생성되지 않는다.

기능을 읽으려면 다음을 include해야 한다:
```cpp
#include "content/public/browser/runtime_feature_state/runtime_feature_state_document_data.h"
#include "third_party/blink/public/common/runtime_feature_state/runtime_feature_state_read_context.h"
```
이를 통해 render frame host를 통해 기능을 읽을 수 있다:
```cpp
RuntimeFeatureStateDocumentData::GetForCurrentDocument(render_frame_host)
  ->runtime_feature_state_read_context()
  IsAmazingNewFeatureEnabled();
```

기능을 쓰려면 다음을 include해야 한다:
```cpp
#include "third_party/blink/public/common/runtime_feature_state/runtime_feature_state_context.h"
```
이를 통해 navigation handle을 통해(커밋되기 전) 기능을 읽고/쓸 수 있다:
```cpp
navigation_handle->GetMutableRuntimeFeatureStateContext().IsAmazingNewFeatureEnabled();
navigation_handle->GetMutableRuntimeFeatureStateContext().SetAmazingNewFeatureEnabled(true);
```

**참고:** 브라우저 프로세스는 HTTP 헤더를 통해 전송된 origin trial 토큰을 볼 수 없으며, 토큰은 페이지 HTML에 포함되어야 한다.
이 토큰을 사용할 개발자에게 해당 제한을 알려주고, 자세한 내용은 [이 버그](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/crbug.com/1377000)를 참조하라.

### IDL 파일
IDL 정의에서 `[RuntimeEnabled=AmazingNewFeature]`처럼 [Blink 확장 속성] `[RuntimeEnabled]`를 사용하라.

**참고:** FeatureNames는 UpperCamelCase를 사용한다. IDL 파일에서도 이 대소문자를 사용하라.

다음 예와 같이 전체 인터페이스를 보호할 수 있다:
```
[
    RuntimeEnabled=AmazingNewFeature  // 전체 인터페이스를 보호한다.
] interface AmazingNewObject {
    attribute DOMString amazingNewAttribute;
    void amazingNewMethod();
};
```
또는 개별 정의 멤버를 보호할 수 있다:
```
interface ExistingObject {
    attribute DOMString existingAttribute;
    // 보호된 속성.
    [RuntimeEnabled=AmazingNewFeature] attribute DOMString amazingNewAttribute;
    // 보호된 메서드.
    [RuntimeEnabled=AmazingNewFeature] void amazingNewMethod();
};
```
**참고:** 개별 인자를 보호할 수는 *없다*. 이는 매우 혼란스럽고 오류가 나기 쉽기 때문이다. 대신 오버로딩을 사용하고 오버로드를 보호하라.

예를 들어 다음 대신:
```
interface ExistingObject {
    foo(long x, [RuntimeEnabled=FeatureName] optional long y); // 이렇게 하지 말라!
};
```
다음처럼 하라:
```
interface ExistingObject {
    // [RuntimeEnabled]가 제거되면 오버로드를 optional로 대체할 수 있다
    foo(long x);
    [RuntimeEnabled=FeatureName] foo(long x, long y);
};
```

**경고:** V8 객체 템플릿 정의는 시작 시 생성되고 런타임 중에는 갱신되지 않으므로, 런타임에 이들의 활성화 상태를 변경할 수 없다.

## 웹 테스트(JavaScript)

[웹 테스트]에서는 다음을 사용해 기능이 활성화되어 있는지 테스트할 수 있다:
```javascript
internals.runtimeFlags.amazingNewFeatureEnabled
```
이 속성은 읽기 전용이며 변경할 수 없다. 단, 해당 기능에 `settable_from_internals: true`가 지정되어 있으면 변경할 수 있다.

**참고:** `internals` JavaScript API는 웹 테스트에서 사용하기 위해 content_shell에서만 사용할 수 있으며 Chromium에는 나타나지 않는다. content_shell의 브라우저 모드에서는 `internals` JavaScript API를 사용하려면 `--expose-internals-for-testing`이 필요하다.

**참고:** 런타임 기능의 이름이 `AmazingNewFeature`라면 JavaScript 변수 이름은 `internals.runtimeFlags.amazingNewFeatureEnabled`이다.

### 웹 테스트 실행하기
content_shell이 웹 테스트용으로 `--stable-release-mode` 플래그와 함께 실행되면, [runtime_enabled_features.json5]에 `status: "test"` 또는 `status: "experimental"`로 나열된 test-only 및 experimental 기능은 꺼진다. [virtual/stable] 스위트는 이 플래그와 함께 실행되며, 이는 이러한 기능의 프로덕션 코드 경로 테스트 커버리지를 보장하는 방법 중 하나다.

## 생성된 파일
[renderer/build/scripts/make_runtime_features.py][make_runtime_features.py]는 [runtime_enabled_features.json5]를 사용해 다음을 생성한다:
```
<compilation directory>/gen/third_party/blink/renderer/platform/runtime_enabled_features.h
<compilation directory>/gen/third_party/blink/renderer/platform/runtime_enabled_features.cc
```
[renderer/build/scripts/make_internal_runtime_flags.py][make_internal_runtime_flags.py]는 [runtime_enabled_features.json5]를 사용해 다음을 생성한다:
```
<compilation directory>/gen/third_party/blink/renderer/core/testing/internal_runtime_flags.idl
<compilation directory>/gen/thrid_party/blink/renderer/core/testing/internal_runtime_flags.h
```
[renderer/bindings/scripts/code_generator_v8.py][code_generator_v8.py]는 생성된 `internal_runtime_flags.idl`을 사용해 다음을 생성한다:
```
<compilation directory>/gen/third_party/blink/renderer/bindings/core/v8/v8_internal_runtime_flags.h
<compilation directory>/gen/third_party/blink/renderer/bindings/core/v8/v8_internal_runtime_flags.cc
```
## 명령줄 스위치
`content`는 개발 중 사용을 의도해 런타임 활성화 기능을 켜거나 끄는 데 사용할 수 있는 두 스위치를 제공한다. 이 스위치들은 `content_shell`과 `chrome` 모두에서 노출된다.
```
--enable-blink-features=SomeNewFeature,SomeOtherNewFeature
--disable-blink-features=SomeOldFeature
```
대부분의 다른 기능 설정을 적용한 뒤, 요청된 기능 설정(쉼표로 구분)이 변경된다. “disable”은 명령줄에 스위치가 나타나는 순서와 관계없이 더 나중에 적용되며(그리고 우선한다). 이 스위치들은 Blink의 상태에만 영향을 준다. 일부 기능은 Chromium에서도 켜야 할 수 있으며, 이 경우 특정 플래그가 필요하다.

## 임베더를 위해
다운스트림 포크는 `runtime_enabled_features.override.json5`에 항목을 추가함으로써 병합 충돌을 처리하지 않고도 `runtime_enabled_features.json5`를 사용자 지정할 수 있다. 재정의 방법의 몇 가지 예는 `runtime_enabled_features.override.json5`에서 찾을 수 있다.

**공지**
[PSA: Runtime Features system is now auto-generated from a .in file.](https://groups.google.com/a/chromium.org/d/msg/blink-dev/JBakhu5J6Qs/re2LkfEslTAJ)

**링크**
* [web tests](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md)
* [supportedPlatforms](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/runtime_enabled_features.json5#36)
* [cssProperties](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/css/css_properties.json5)
* [virtual test suite](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md#testing-runtime-flags)
* [flag-specific](https://chromium.googlesource.com/chromium/src/+/main/docs/testing/web_tests.md#testing-runtime-flags)
* [trybot (example)](https://chromium-review.googlesource.com/c/chromium/src/+/1850255)
* [LayoutNG](https://docs.google.com/document/d/17t6HjA5X8T5xq1LlKoLEGTn_MioGCdEPpijpJeLalK0/edit#heading=h.guvbepjyp0oj)
* [BlinkGenPropertyTrees](https://crbug.com/836884)
* [blink launch process](https://www.chromium.org/blink/launching-features)
* [Blink extended attribute](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/bindings/IDLExtendedAttributes.md)
* [make_runtime_features.py](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/build/scripts/make_runtime_features.py)
* [runtime_enabled_features.json5](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/runtime_enabled_features.json5)
* [make_internal_runtime_flags.py](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/build/scripts/make_internal_runtime_flags.py)
* [code_generator_v8.py](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/bindings/scripts/code_generator_v8.py)
* [virtual/stable](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/web_tests/VirtualTestSuites;drc=9878f26d52d32871ed1c085444196e5453909eec;l=112)
* [content/child/runtime_features.cc](https://source.chromium.org/chromium/chromium/src/+/main:content/child/runtime_features.cc)
* [initialize blink features](https://chromium.googlesource.com/chromium/src/+/main/docs/initialize_blink_features.md)
* [controlled by chromium feature](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/platform/runtime_enabled_features.json5;drc=70bddadf50a14254072cf7ca0bcf83e4331a7d4f;l=833)

---

원문: https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md

## History
- 2026-07-06 12:11 Chromium Runtime Enabled Features 문서 한국어 전체 번역 노트 최초 생성
