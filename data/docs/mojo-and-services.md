---
title: Mojo 및 서비스 소개
order: 30
group: 번역 · docs
description: Mojo IPC와 서비스 아키텍처 입문
source_path: docs/mojo_and_services.md
source_sha256: 9f493774958d0e5b4fc8d0bcf2dd12369d69531fb620cf04daeb7016bfb05f7c
translation_status: full
---
> 이 문서는 **Intro to Mojo and Services**([`docs/mojo_and_services.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/mojo_and_services.md)) 문서의 한국어 전체 번역입니다.

## 개요

이 문서는 개발자가 Chromium에서 Mojo를 효과적으로 사용하기 시작하는 데 필요한 최소한의 정보를 담고 있으며, 예제 Mojo 인터페이스 사용법, 서비스 정의와 연결, 그리고 Content 계층의 핵심 서비스에 대한 간단한 개요를 포함한다.

입문 가이드, API 레퍼런스 등은 다른 [Mojo 및 Services](https://chromium.googlesource.com/chromium/src/+/main/docs/README.md#Mojo-Services) 문서를 참고하라.

## Mojo 용어

**메시지 파이프(message pipe)** 는 한 쌍의 **엔드포인트(endpoint)** 이다. 각 엔드포인트에는 수신 메시지 큐가 있으며, 한 엔드포인트에 메시지를 쓰면 사실상 그 메시지가 다른 쪽(**피어(peer)**) 엔드포인트에 큐잉된다. 따라서 메시지 파이프는 양방향이다.

**mojom** 파일은 **인터페이스(interface)** 를 기술하며, 인터페이스는 강한 타입을 갖는 **메시지(message)** 컬렉션이다. Google protobuf에 익숙한 개발자에게는, 각 인터페이스 메시지가 대략 하나의 proto 메시지와 유사하다.

mojom 인터페이스와 메시지 파이프가 주어지면, 엔드포인트 중 하나를 **`Remote`** 로 지정할 수 있으며, 이는 인터페이스가 기술하는 메시지를 *보내는* 데 사용된다. 다른 엔드포인트는 **`Receiver`** 로 지정할 수 있으며, 인터페이스 메시지를 *받는* 데 사용된다.

*** aside
참고: 위 일반화는 약간 지나치게 단순화한 것이다. 메시지 파이프는 여전히 양방향이며, mojom 메시지가 응답을 기대할 수도 있다는 점을 기억하라. 응답은 `Receiver` 엔드포인트에서 전송되고 `Remote` 엔드포인트에서 수신된다.
***

수신된 메시지를 처리하려면 `Receiver` 엔드포인트가 해당 mojom 인터페이스의 **구현(implementation)** 과 연결되어 있어야 한다. (*즉,* **바인드(bound)** 되어 있어야 한다.) 수신된 메시지는 구현 객체의 대응되는 인터페이스 메서드를 호출하는 예약된 태스크로 디스패치된다.

이 모든 것을 생각하는 또 다른 방식은 단순히 다음과 같다. **`Remote`는 대응되는 원격 `Receiver`와 연결된 자기 인터페이스의 원격 구현에 대해 호출을 수행한다.**

## 예제: 새 Frame 인터페이스 정의하기

이를 Chrome에 적용해 보자. 렌더 프레임에서 브라우저 프로세스의 대응되는 `RenderFrameHostImpl` 인스턴스로 "Ping" 메시지를 보내고 싶다고 가정하자. 이를 위해 적절한 mojom 인터페이스를 정의하고, 그 인터페이스를 사용할 파이프를 만들고, 전송된 메시지가 그곳에서 수신 및 처리될 수 있도록 파이프의 한쪽 끝을 올바른 위치까지 연결해야 한다. 이 절에서는 그 과정을 자세히 살펴본다.

### 인터페이스 정의하기

첫 번째 단계는 다음과 같이 인터페이스 정의가 들어 있는 새 `.mojom` 파일을 만드는 것이다.

``` cpp
// src/example/public/mojom/pingable.mojom
module example.mojom;

interface Pingable {
  // "Ping"을 수신하고 임의의 정수로 응답한다.
  Ping() => (int32 random);
};
```

여기에는 이 정의에 대한 C++ 바인딩을 생성하기 위한 대응되는 빌드 규칙이 있어야 한다.

``` python
# src/example/public/mojom/BUILD.gn
import("//mojo/public/tools/bindings/mojom.gni")
mojom("mojom") {
  sources = [ "pingable.mojom" ]
}
```

### 파이프 만들기

이제 이 인터페이스를 사용할 메시지 파이프를 만들어 보자.

*** aside
일반적인 규칙이자 Mojo 사용 시 편의를 위한 관례로, 인터페이스의 *클라이언트* (*즉,* `Remote` 쪽)가 보통 새 파이프를 만드는 주체다. 이는 `Remote`가 InterfaceRequest 엔드포인트가 어디론가 전달되거나 바인드되기를 기다리지 않고도 즉시 메시지 전송을 시작하는 데 사용될 수 있기 때문에 편리하다.
***

이 코드는 렌더러 어딘가에 배치될 것이다.

```cpp
// src/third_party/blink/example/public/pingable.h
mojo::Remote<example::mojom::Pingable> pingable;
mojo::PendingReceiver<example::mojom::Pingable> receiver =
    pingable.BindNewPipeAndPassReceiver();
```

이 예제에서 ```pingable```은 `Remote`이고, ```receiver```는 `PendingReceiver`다. `PendingReceiver`는 나중에 결국 `Receiver`로 바뀔 `Receiver`의 전 단계 객체다. `BindNewPipeAndPassReceiver`는 메시지 파이프를 만드는 가장 일반적인 방식이다. 이 함수는 반환값으로 `PendingReceiver`를 산출한다.

*** aside
참고: `PendingReceiver`는 실제로 아무것도 **하지** 않는다. 이는 단일 메시지 파이프 엔드포인트를 담는 비활성 홀더다. 이것은 오직 그 엔드포인트가 같은 인터페이스 타입의 `Receiver`에 의해 바인드될 것으로 기대된다는 점을 나타내어, 컴파일 시점에 엔드포인트의 타입을 더 강하게 만들기 위해 존재한다.
***

### 메시지 보내기

마지막으로, `Remote`에서 `Ping()` 메서드를 호출하여 메시지를 보낼 수 있다.

```cpp
// src/third_party/blink/example/public/pingable.h
pingable->Ping(base::BindOnce(&OnPong));
```

*** aside
**중요:** 응답을 받고 싶다면 `OnPong`이 호출될 때까지 `pingable` 객체를 살아 있게 유지해야 한다. 결국 `pingable`은 자기 메시지 파이프 엔드포인트를 *소유*한다. 이것이 파괴되면 엔드포인트도 파괴되며, 응답 메시지를 받을 대상이 아무것도 남지 않는다.
***

거의 끝났다! 물론 모든 것이 이렇게 쉬웠다면 이 문서가 존재할 필요도 없었을 것이다. 우리는 렌더러 프로세스에서 브라우저 프로세스로 메시지를 보내는 어려운 문제를, 위의 `receiver` 객체를 가져와 브라우저 프로세스에 어떻게든 전달하여 그곳에서 수신 메시지를 디스패치하는 `Receiver`로 바꿀 수 있게 하는 문제로 변환했다.

### 브라우저에 `PendingReceiver` 보내기

`PendingReceiver`들(그리고 일반적으로 메시지 파이프 엔드포인트들)은 mojom 메시지를 통해 자유롭게 전송할 수 있는 또 다른 종류의 객체일 뿐이라는 점에 주목할 가치가 있다. `PendingReceiver`를 어딘가로 가져가는 가장 일반적인 방법은 이미 연결된 다른 인터페이스의 메서드 인자로 전달하는 것이다.

렌더러의 `RenderFrameImpl`과 브라우저의 대응되는 `RenderFrameHostImpl` 사이에 항상 연결되어 있는 이러한 인터페이스 중 하나가 [`BrowserInterfaceBroker`](https://cs.chromium.org/chromium/src/third_party/blink/public/mojom/browser_interface_broker.mojom)다. 이 인터페이스는 다른 인터페이스를 획득하기 위한 팩토리다. 이 인터페이스의 `GetInterface` 메서드는 임의의 인터페이스 receiver를 전달할 수 있게 해 주는 `GenericPendingReceiver`를 받는다.

``` cpp
interface BrowserInterfaceBroker {
  GetInterface(mojo_base.mojom.GenericPendingReceiver receiver);
}
```
`GenericPendingReceiver`는 어떤 특정 `PendingReceiver`로부터도 암시적으로 생성될 수 있으므로, 앞서 `BindNewPipeAndPassReceiver`를 통해 만든 `receiver` 객체로 이 메서드를 호출할 수 있다.

``` cpp
RenderFrame* my_frame = GetMyFrame();
my_frame->GetBrowserInterfaceBroker().GetInterface(std::move(receiver));
```

이는 `PendingReceiver` 엔드포인트를 브라우저 프로세스로 전달하며, 그곳에서 대응되는 `BrowserInterfaceBroker` 구현이 이를 수신한다. 이에 대해서는 아래에서 더 설명한다.

### 인터페이스 구현하기

마지막으로, 브라우저 쪽에서 `Pingable` 인터페이스 구현이 필요하다.

```cpp
#include "example/public/mojom/pingable.mojom.h"

class PingableImpl : example::mojom::Pingable {
 public:
  explicit PingableImpl(mojo::PendingReceiver<example::mojom::Pingable> receiver)
      : receiver_(this, std::move(receiver)) {}
  PingableImpl(const PingableImpl&) = delete;
  PingableImpl& operator=(const PingableImpl&) = delete;

  // example::mojom::Pingable:
  void Ping(PingCallback callback) override {
    // 공정한 주사위 굴림으로 선택된 임의의 4로 응답한다.
    std::move(callback).Run(4);
  }

 private:
  mojo::Receiver<example::mojom::Pingable> receiver_;
};
```

`RenderFrameHostImpl`은 `BrowserInterfaceBroker`의 구현을 소유한다. 이 구현이 `GetInterface` 메서드 호출을 수신하면, 이 특정 인터페이스에 대해 이전에 등록된 핸들러를 호출한다.

``` cpp
// render_frame_host_impl.h
class RenderFrameHostImpl
  ...
  void GetPingable(mojo::PendingReceiver<example::mojom::Pingable> receiver);
  ...
 private:
  ...
  std::unique_ptr<PingableImpl> pingable_;
  ...
};

// render_frame_host_impl.cc
void RenderFrameHostImpl::GetPingable(
    mojo::PendingReceiver<example::mojom::Pingable> receiver) {
  pingable_ = std::make_unique<PingableImpl>(std::move(receiver));
}

// browser_interface_binders.cc
void PopulateFrameBinders(RenderFrameHostImpl* host,
                          mojo::BinderMap* map) {
...
  // Pingable용 핸들러를 등록한다.
  map->Add<example::mojom::Pingable>(base::BindRepeating(
    &RenderFrameHostImpl::GetPingable, base::Unretained(host)));
}
```

이제 끝났다. 이 설정은 렌더러 프레임과 브라우저 쪽 host 객체 사이에 새 인터페이스 연결을 배관(plumb)하기에 충분하다!

렌더러에서 `pingable` 객체를 충분히 오래 살아 있게 유지했다고 가정하면, 결국 위의 브라우저 쪽 구현에서 정의한 완전히 임의의 값 `4`와 함께 그 `OnPong` 콜백이 호출되는 것을 보게 될 것이다.

## 서비스 개요 및 용어
이전 절은 Chromium에서 Mojo IPC가 어떻게 사용되는지의 겉면만 살짝 다룬 것이다. 렌더러-브라우저 메시징은 단순하고 순수한 코드 양만 놓고 보면 아마도 가장 널리 쓰이는 사용 방식이지만, 우리는 전통적인 Content 브라우저/렌더러/gpu/유틸리티 프로세스 분할보다 조금 더 세분화된 서비스 집합으로 코드베이스를 점진적으로 분해하고 있다.

**서비스(service)** 는 하나 이상의 관련 기능 또는 동작을 구현하는 자체 완결적인 코드 라이브러리이며, 외부 코드와의 상호작용은 일반적으로 브라우저 프로세스가 중개하는 Mojo 인터페이스 연결을 통해서만 *독점적으로* 이루어진다.

각 서비스는 브라우저가 서비스 인스턴스를 관리하는 데 사용할 수 있는 주 Mojo 인터페이스를 정의하고 구현한다.

## 예제: 단순한 Out-of-Process 서비스 만들기

Chromium에서 새 서비스를 준비하고 실행하기 위해 일반적으로 필요한 단계는 여러 가지가 있다.

- 주 서비스 인터페이스와 구현을 정의한다
- out-of-process 코드에서 구현을 연결한다
- 서비스 프로세스를 시작하기 위한 브라우저 로직을 작성한다

이 절에서는 간단한 설명과 함께 이 단계들을 차례로 살펴본다. 여기에서 사용되는 개념과 API에 대한 더 자세한 문서는 [Mojo](https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md) 문서를 참고하라.

### 서비스 정의하기

일반적으로 서비스 정의는 트리의 최상위 또는 어떤 하위 디렉터리 안의 `services` 디렉터리에 배치된다. 이 예제에서는 Chrome에서 특별히 사용할 새 서비스를 정의할 것이므로, `//chrome/services` 안에 정의한다.

다음 파일들을 만들 수 있다. 먼저 몇 가지 mojom이다.

``` cpp
// src/chrome/services/math/public/mojom/math_service.mojom
module math.mojom;

interface MathService {
  Divide(int32 dividend, int32 divisor) => (int32 quotient);
};
```

``` python
# src/chrome/services/math/public/mojom/BUILD.gn
import("//mojo/public/tools/bindings/mojom.gni")

mojom("mojom") {
  sources = [
    "math_service.mojom",
  ]
}
```

그 다음 실제 `MathService` 구현이다.

``` cpp
// src/chrome/services/math/math_service.h
#include "chrome/services/math/public/mojom/math_service.mojom.h"

namespace math {

class MathService : public mojom::MathService {
 public:
  explicit MathService(mojo::PendingReceiver<mojom::MathService> receiver);
  MathService(const MathService&) = delete;
  MathService& operator=(const MathService&) = delete;
  ~MathService() override;

 private:
  // mojom::MathService:
  void Divide(int32_t dividend,
              int32_t divisor,
              DivideCallback callback) override;

  mojo::Receiver<mojom::MathService> receiver_;
};

}  // namespace math
```

``` cpp
// src/chrome/services/math/math_service.cc
#include "chrome/services/math/math_service.h"

namespace math {

MathService::MathService(mojo::PendingReceiver<mojom::MathService> receiver)
    : receiver_(this, std::move(receiver)) {}

MathService::~MathService() = default;

void MathService::Divide(int32_t dividend,
                         int32_t divisor,
                         DivideCallback callback) {
  // 몫으로 응답한다!
  std::move(callback).Run(dividend / divisor);
}

}  // namespace math
```

``` python
# src/chrome/services/math/BUILD.gn

source_set("math") {
  sources = [
    "math_service.cc",
    "math_service.h",
  ]

  deps = [
    "//base",
    "//chrome/services/math/public/mojom",
  ]
}
```

이제 in-process 또는 out-of-process로 제공할 수 있는 완전히 정의된 `MathService` 구현이 생겼다.

### 서비스 구현 연결하기

out-of-process Chrome 서비스의 경우, [`//chrome/utility/services.cc`](https://cs.chromium.org/chromium/src/chrome/utility/services.cc)에 팩토리 함수를 등록하기만 하면 된다.

``` cpp
auto RunMathService(mojo::PendingReceiver<math::mojom::MathService> receiver) {
  return std::make_unique<math::MathService>(std::move(receiver));
}

void RegisterMainThreadServices(mojo::ServiceFactory& services) {
  // 기존 서비스들...
  services.Add(RunFilePatcher);
  services.Add(RunUnzipper);

  // 이 목록에 우리 자신의 팩토리를 추가한다
  services.Add(RunMathService);
  //...
```

이렇게 하면 이제 브라우저 프로세스가 MathService의 새 out-of-process 인스턴스를 시작할 수 있다.

### 서비스 시작하기

서비스를 in-process로 실행한다면, 실제로 더 할 만한 흥미로운 일은 없다. 다른 객체와 마찬가지로 서비스 구현을 인스턴스화할 수 있지만, 동시에 out-of-process인 것처럼 Mojo Remote를 통해 이 구현과 대화할 수도 있다.

이전 절에서 수행한 연결 이후 out-of-process 서비스 인스턴스를 시작하려면, Content의 [`ServiceProcessHost`](https://cs.chromium.org/chromium/src/content/public/browser/service_process_host.h?rcl=e7a1f6c9a24f3151c875598174a05167fb12c5d5&l=47) API를 사용하라.

``` cpp
mojo::Remote<math::mojom::MathService> math_service =
    content::ServiceProcessHost::Launch<math::mojom::MathService>(
        content::ServiceProcessHost::Options()
            .WithDisplayName("Math!")
            .Pass());
```

크래시가 발생하는 경우를 제외하면, 시작된 프로세스는 `math_service`가 살아 있는 동안 살아 있다. 이에 따른 귀결로, `math_service`를 파괴하거나 재설정함으로써 프로세스를 강제로 종료시킬 수 있다.

이제 out-of-process 나눗셈을 수행할 수 있다.

``` cpp
// 참고: 클라이언트로서 우리는 연결에 대한 어떤 승인이나 확인을 기다릴 필요가 없다.
// 즉시 메시지를 큐잉하기 시작할 수 있으며,
// 서비스가 준비되어 실행되는 즉시 메시지들이 전달된다.
math_service->Divide(
    42, 6, base::BindOnce([](int32_t quotient) { LOG(INFO) << quotient; }));
```
*** aside
참고: 응답 콜백 실행을 보장하려면 `mojo::Remote<math::mojom::MathService>` 객체를 살아 있게 유지해야 한다. ([이 절](https://chromium.googlesource.com/chromium/src/+/main/mojo/public/cpp/bindings/README.md#A-Note-About-Endpoint-Lifetime-and-Callbacks)과 [앞 절의 이 참고](#메시지-보내기)를 보라.)
***

### 샌드박스 지정하기

모든 서비스는 샌드박스를 지정해야 한다. 이상적으로 서비스는 운영체제 리소스에 접근할 필요가 없는 한 `kService` 프로세스 샌드박스 안에서 실행된다. 커스텀 샌드박스가 필요한 서비스의 경우 security-dev@chromium.org와 상의하여 새 샌드박스 타입을 정의해야 한다.

인터페이스의 샌드박스를 정의하는 선호 방식은 `.mojom` 파일 안의 `interface {}`에 `[ServiceSandbox=type]` 속성을 지정하는 것이다.

```
import "sandbox/policy/mojom/sandbox.mojom";
[ServiceSandbox=sandbox.mojom.Sandbox.kService]
interface FakeService {
  ...
};
```

유효한 값은 [`//sandbox/policy/mojom/sandbox.mojom`](https://cs.chromium.org/chromium/src/sandbox/policy/mojom/sandbox.mojom)에 있는 값들이다. 샌드박스는 인터페이스가 `content::ServiceProcessHost::Launch()`를 사용해 out-of-process로 시작되는 경우에만 적용된다는 점에 유의하라.

최후의 수단으로, 기반 플랫폼 샌드박스에 대한 동적 또는 기능 기반 매핑을 달성할 수는 있지만, 이를 위해서는 ContentBrowserClient를 통한 배관 작업이 필요하다. (예: `ShouldSandboxNetworkService()`)

## Content 계층 서비스 개요

### 인터페이스 브로커

우리는 렌더러의 frame 객체와 브라우저 프로세스의 대응되는 `RenderFrameHostImpl` 사이에 지속적인 연결을 갖는 명시적인 mojom 인터페이스를 정의한다. 이 인터페이스는 [`BrowserInterfaceBroker`](https://cs.chromium.org/chromium/src/third_party/blink/public/mojom/browser_interface_broker.mojom?rcl=09aa5ae71649974cae8ad4f889d7cd093637ccdb&l=11)라고 하며, 작업하기가 꽤 쉽다. `RenderFrameHostImpl`에 새 메서드를 추가하면 된다.

``` cpp
void RenderFrameHostImpl::GetGoatTeleporter(
    mojo::PendingReceiver<magic::mojom::GoatTeleporter> receiver) {
  goat_teleporter_receiver_.Bind(std::move(receiver));
}
```

그리고 이 메서드를 `browser_interface_binders.cc`의 `PopulateFrameBinders` 함수에 등록한다. 이 함수는 특정 인터페이스들을 각각의 host에 있는 핸들러로 매핑한다.

``` cpp
// //content/browser/browser_interface_binders.cc
void PopulateFrameBinders(RenderFrameHostImpl* host,
                          mojo::BinderMap* map) {
...
  map->Add<magic::mojom::GoatTeleporter>(base::BindRepeating(
      &RenderFrameHostImpl::GetGoatTeleporter, base::Unretained(host)));
}
```

태스크 러너를 지정하여 다른 sequence에서 인터페이스를 바인드하는 것도 가능하다.

``` cpp
// //content/browser/browser_interface_binders.cc
void PopulateFrameBinders(RenderFrameHostImpl* host,
                          mojo::BinderMap* map) {
...
  map->Add<magic::mojom::GoatTeleporter>(base::BindRepeating(
      &RenderFrameHostImpl::GetGoatTeleporter, base::Unretained(host)),
      GetIOThreadTaskRunner({}));
}
```

Worker들도 렌더러와 브라우저 프로세스의 대응되는 원격 구현 사이에 `BrowserInterfaceBroker` 연결을 가진다. 새 worker 전용 인터페이스를 추가하는 것은 위에서 frame에 대해 자세히 설명한 단계와 유사하지만, 다음과 같은 차이가 있다.
 - Dedicated Worker의 경우, [`DedicatedWorkerHost`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/worker_host/dedicated_worker_host.h)에 새 메서드를 추가하고 [`PopulateDedicatedWorkerBinders`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/browser_interface_binders.cc;l=1126;drc=e24e0a914ff0da18e78044ebad7518afe9e13847)에 등록한다
 - Shared Worker의 경우, [`SharedWorkerHost`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/worker_host/shared_worker_host.h)에 새 메서드를 추가하고 [`PopulateSharedWorkerBinders`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/browser_interface_binders.cc;l=1232;drc=e24e0a914ff0da18e78044ebad7518afe9e13847)에 등록한다
 - Service Worker의 경우, [`ServiceWorkerHost`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/service_worker/service_worker_host.h)에 새 메서드를 추가하고 [`PopulateServiceWorkerBinders`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/browser_interface_binders.cc;l=1326;drc=e24e0a914ff0da18e78044ebad7518afe9e13847)에 등록한다

인터페이스는 렌더러의 Blink `Platform` 객체와 브라우저 프로세스의 대응되는 `RenderProcessHost` 객체 사이의 `BrowserInterfaceBroker` 연결을 사용하여 프로세스 수준에서도 추가될 수 있다. 이렇게 하면 렌더러 안의 어떤 스레드(frame 및 worker 스레드 포함)든 해당 인터페이스에 접근할 수 있지만, 사용되는 `BrowserInterfaceBroker` 구현이 스레드 안전해야 하므로 추가 오버헤드가 따른다. 새 프로세스 수준 인터페이스를 추가하려면, `RenderProcessHostImpl`에 새 메서드를 추가하고 [`RenderProcessHostImpl::RegisterMojoInterfaces`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/renderer_host/render_process_host_impl.cc;l=2317;drc=a817d852ea2f2085624d64154ad847dfa3faaeb6) 안에서 [`AddUIThreadInterface`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/renderer_host/render_process_host_impl.h;l=918;drc=ec5eaba0e021b757d5cbbf2c27ac8f06809d81e9)를 호출하여 등록한다. 렌더러 쪽에서는 [`Platform::GetBrowserInterfaceBroker`](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/public/platform/platform.h;l=781;drc=ee1482552c4c97b40f15605fe6a52565cfe74548)를 사용하여 대응되는 `BrowserInterfaceBroker` 객체를 얻고, 그 객체에서 `GetInterface`를 호출한다.

embedder 전용 document-scoped 인터페이스를 바인드하려면, [`ContentBrowserClient::RegisterBrowserInterfaceBindersForFrame()`](https://cs.chromium.org/chromium/src/content/public/browser/content_browser_client.h?rcl=3eb14ce219e383daa0cd8d743f475f9d9ce8c81a&l=999)을 오버라이드하고 제공된 map에 binder들을 추가한다.

*** aside
참고: BrowserInterfaceBroker가 요청된 인터페이스에 대한 binder를 찾을 수 없으면, 관련 context host에서 `ReportNoBinderForInterface()`를 호출하며, 이는 host의 receiver에서 `ReportBadMessage()` 호출로 이어진다. (그 결과 중 하나는 렌더러 종료다.) 테스트에서 이러한 크래시를 피하려면(content_shell이 일부 Chrome 전용 인터페이스를 바인드하지 않지만 렌더러가 어쨌든 그것들을 요청하는 경우), `browser_interface_binders.cc`의 [`EmptyBinderForFrame`](https://cs.chromium.org/chromium/src/content/browser/browser_interface_binders.cc?rcl=12e73e76a6898cb6df6a361a98320a8936f37949&l=407) 헬퍼를 사용하라. 그러나 가능하다면 렌더러 쪽과 브라우저 쪽을 일관되게 유지하는 것이 권장된다.
***

### Navigation-Associated 인터페이스

서로 다른 frame에서 오는 메시지들의 순서가 중요한 경우, 그리고 메시지들이 navigation을 구현하는 메시지들과 관련하여 올바르게 정렬되어야 하는 경우에는 navigation-associated 인터페이스를 사용할 수 있다. Navigation-associated 인터페이스는 각 frame에서 대응되는 `RenderFrameHostImpl` 객체로 가는 연결을 활용하며, navigation과 관련된 메시지에 사용되는 동일한 FIFO 파이프를 통해 각 연결의 메시지를 보낸다. 그 결과 navigation 이후에 전송된 메시지는 navigation 관련 메시지 이후에 브라우저 프로세스에 도착하는 것이 보장되며, 같은 document의 서로 다른 frame에서 전송된 메시지들의 순서도 보존된다.

새 navigation-associated 인터페이스를 추가하려면, `RenderFrameHostImpl`에 새 메서드를 만들고 [`RenderFrameHostImpl::SetUpMojoConnection`](https://source.chromium.org/chromium/chromium/src/+/main:content/browser/renderer_host/render_frame_host_impl.cc;l=8365;drc=a817d852ea2f2085624d64154ad847dfa3faaeb6)에서 `associated_registry_->AddInterface` 호출로 이를 등록한다. 렌더러에서는 [`LocalFrame::GetRemoteNavigationAssociatedInterfaces`](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/frame/local_frame.h;l=409;drc=19f17a30e102f811bc90a13f79e8ad39193a6403)를 사용하여 `GetInterface`를 호출할 객체를 얻는다. (이 호출은 pending receiver 대신 [pending associated receiver](https://chromium.googlesource.com/chromium/src/+/main/mojo/public/cpp/bindings/README.md#associated-interfaces)를 받는다는 점을 제외하면 `BrowserInterfaceBroker::GetInterface`와 유사하다.)

## 추가 지원

이 문서가 어떤 식으로든 도움이 되지 않았다면, 친절한 [chromium-mojo@chromium.org](https://groups.google.com/a/chromium.org/forum/#!forum/chromium-mojo) 또는 [services-dev@chromium.org](https://groups.google.com/a/chromium.org/forum/#!forum/services-dev) 메일링 리스트에 메시지를 게시하라.
