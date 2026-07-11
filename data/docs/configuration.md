---
title: '구성: Prefs, Settings, Features, Switches & Flags'
order: 31
group: 번역 · docs
description: Prefs·Settings·Features·Switches·Flags 구분
source_path: docs/configuration.md
source_sha256: 199a8e79d9f69368281c5455aef51211545872ba2139477c3296503574649bdc
translation_status: full
---
> 이 문서는 **Configuration: Prefs, Settings, Features, Switches & Flags**([`docs/configuration.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/configuration.md)) 문서의 한국어 전체 번역입니다.

이 문서는 Chromium의 모든 런타임 구성 표면을 개괄하고, 각각에 대한 적절한 사용처와 표준 패턴을 논의한다. 이들 중 일부는 사용자가 쓰도록 의도되었고, 일부는 개발자가, 일부는 시스템 관리자가 쓰도록 의도되었다.


## Prefs

예: prefs::kAllowDinosaurEasterEgg, 일명 "allow_dinosaur_easter_egg"

Prefs는 중앙 pref 서비스에 등록해서 구현하며, 보통 [Profile::RegisterProfilePrefs][profile-register]를 통해 등록한다. Prefs는 타입이 지정된 값을 저장하며, 이 값은 재시작 후에도 유지되고 Sync 서비스를 통해 브라우저 인스턴스 간에 동기화될 수 있다. pref 저장소는 여러 종류가 있으며, [prefs 문서][prefs]에 자세히 문서화되어 있다. Prefs는 엔터프라이즈 정책을 통해 직접 구성할 수 있다.

Prefs:

* 사용자에게 직접 노출되지는 *않는다*
* 사용자의 언어로 현지화되지는 *않는다*
* 해당 pref에 대응하는 정책이 있으면 엔터프라이즈 정책으로 구성할 수 *있다*
  (임의의 pref를 설정할 수 있게 해 주는 포괄 정책은 없다)
* 사용 중일 때 UMA로 보고되지는 *않는다*
* chrome://version에 포함되지는 *않는다*
* 재시작 후에도 자동으로 지속된다(보통은)

## Features

예: base::kDCheckIsFatalFeature

Features는 어디서든 [base::Feature][base-feature]를 만들어 구현한다. Features는 서버 측 실험을 통해 활성화할 수도 있고, 명령줄에서 "--enable-features"를 사용해 활성화할 수도 있다. 어떤 features가 사용 중인지는 UMA 메트릭으로 추적되며, chrome://version의 "Variations" 필드에서 볼 수 있다. 단, 릴리스 빌드에서는 variation의 문자열 이름 대신 일련의 해시만 chrome://version에 표시되지만, 필요한 경우 이 해시를 다시 문자열 이름으로 바꿀 수 있다. 이는 Google 내부 도구를 참조해서 수행한다.

*Features는 런타임 조건부 동작을 추가하는 가장 좋은 방법이다.*

Features:

* 사용자에게 직접 노출되지는 *않는다*
* 사용자의 언어로 현지화되지는 *않는다*
* 엔터프라이즈 정책으로 구성할 수는 *없다*
* 사용 중일 때 UMA/crash로 보고된다
* chrome://version에 포함된다
* 재시작 후 자동으로 지속되지는 *않는다*

## Switches

예: switches::kIncognito, 일명 "--incognito"

Switches는 코드베이스 어디서든 [base::CommandLine::ForCurrentProcess][base-commandline] 안에 특정 switch가 있는지 또는 그 값이 무엇인지를 검사해서 구현한다. switch의 중앙 등록소는 없으며, 사실상 어떤 목적에든 사용할 수 있다.

Switches:

* 사용자에게 직접 노출되지는 *않는다*
* 사용자의 언어로 현지화되지는 *않는다*
* 엔터프라이즈 정책으로 구성할 수는 *없다*(Chrome OS에서는 FeatureFlagsProto를 통해 예외)
* 사용 중일 때 UMA로 보고되지는 *않는다*
* chrome://version에 포함된다
* 재시작 후 자동으로 지속되지는 *않는다*

일반적으로 switches는 base::Feature를 사용하는 것보다 열등하다. base::Feature는 같은 기능과 낮은 엔지니어링 오버헤드를 제공하면서도 UMA 보고와 연결되기 때문이다. 새 코드는 switches 대신 base::Feature를 사용해야 한다. 단, 구성 값이 문자열인 경우는 예외인데, features는 임의의 문자열 값을 받을 수 없기 때문이다.

## Flags

예: chrome://flags/#ignore-gpu-blocklist

Flags는 flag를 설명하는 항목을 [about_flags.cc][about-flags]에 추가하고, [flag-metadata][flag-metadata]에도 메타데이터를 추가해서 구현한다. Flags에는 이름과 설명이 있으며, chrome://flags에 표시된다. Flags에는 만료 milestone도 있는데, 이 milestone이 지나면 해당 UI에서 숨겨지고 비활성화된 뒤, 나중에 제거된다. Flags는 feature 또는 switches 집합으로 뒷받침되며, flag 값에 따라 브라우저 시작 시 이들을 활성화한다.

Flags는 보통 feature의 출시 전 테스트를 가능하게 하기 위한 임시 수단이어야 한다. 영구 flags(만료가 -1인 것)는 다음 중 하나에 해당할 때만 사용해야 한다.

* 지원/디버깅 목적으로 정기적으로 사용되는 flag인 경우. 예를 들어 사용자가 가능한 문제를 제거해 보기 위해 켜 보도록 요청받는 경우(예: ignore-gpu-blocklist)
* 명령줄 switches를 사용할 수 없는 환경(예: 모바일)에서 지속적인 QA/테스트 목적으로 사용되는 flag인 경우

"사용자가 이 기능을 켜거나 꺼야 할 수도 있다"는 영구 flag의 충분한 정당화가 아니다. 가능하다면 사용자가 기능을 끄고 싶어 하거나 끌 필요가 없도록 기능을 설계해야 한다. 하지만 그 선택지를 유지해야 한다면, 번역과 지원이 있는 완전한 setting(아래 참고)으로 승격해야 한다. 반면 "개발자/QA가 이 기능을 켜거나 꺼야 할 수도 있다"는 영구 flag의 정당화가 된다.

Flags:

* 사용자에게 직접 노출된다
* 사용자의 언어로 현지화되지는 *않는다*
* 엔터프라이즈 정책으로 구성할 수는 *없다*
* 사용 중일 때 UMA로 보고된다(`Launch.FlagsAtStartup`을 통해)
* chrome://version에 포함되지는 *않는다*
* 재시작 후 자동으로 지속된다

## Settings

예: "Show home button"

Settings는 WebUI에서 구현되며, chrome://settings 또는 그 하위 페이지 중 하나에 표시된다. 보통 setting의 값을 저장하는 pref에 바인딩된다. Settings는 추가 비용이 비교적 큰 편이다. 현지화가 필요하고, chrome://settings 안에 어떻게 맞춰 넣을지 결정하기 위해 어느 정도의 UX 관여가 필요하며, 문서화와 지원 자료도 필요하기 때문이다. 많은 settings가 prefs를 통해 구현되지만, 모든 prefs가 settings에 대응하는 것은 아니다. 일부 prefs는 재시작 사이에 내부 브라우저 상태를 추적하는 데 사용된다.

Settings:

* 사용자에게 직접 노출된다
* 사용자의 언어로 현지화된다
* 엔터프라이즈 정책으로 구성할 수는 *없다*(다만 이를 뒷받침하는 prefs는 가능할 수 있다)
* 사용 중일 때 UMA로 보고되지는 *않는다*
* chrome://version에 포함되지는 *않는다*
* 재시작 후 자동으로 지속된다(이를 뒷받침하는 prefs를 통해)

최종 사용자가 이 동작을 바꾸고 싶어 할 수 있다면 setting을 추가해야 한다. 어떤 것이 flag여야 하는지 setting이어야 하는지 판단하는 괜찮은 리트머스 테스트는 다음과 같다. "코드를 읽거나 쓸 수 없는 사람이 이것을 바꾸고 싶어 할 것인가?"

## 요약 표
|                                              | Prefs       | Features       | Switches | Flags                               | Settings                          |
| :-                                           | :-          | :-             | :--:     | :--:                                | :-                                |
| 사용자에게 직접 노출                         | ❌          | ❌            | ❌       | ✅                                  | ✅                                |
| 사용자의 언어로 현지화                       | ❌          | ❌            | ❌       | ❌                                  | ✅                                |
| 엔터프라이즈 정책으로 구성 가능              | ✅ pref에 매핑되는 정책이 있는 경우 | ❌ | ❌ ChromeOS에서는 예외 | ❌         | ❌ 다만 이를 뒷받침하는 prefs는 가능할 수 있음 |
| 사용 중일 때 보고                            | ❌          | UMA/crash를 통해 |  ❌      | UMA<br> `Launch.FlagsAtStartup`를 통해 | ❌                                |
| chrome://version에 포함                      | ❌          | ✅            | ✅       | ❌                                  | ❌                                |
| 재시작 후 자동 지속                          | ✅ 보통은   | ❌            | ❌       | ✅                                  | ✅ backing prefs를 통해           |

## 관련 문서

* [Chromium Feature API & Finch (Googler 전용)](http://go/finch-feature-api)
* [chrome://flags에 새 feature flag 추가하기](https://chromium.googlesource.com/chromium/src/+/main/docs/how_to_add_your_feature_flag.md)
* [Runtime Enabled Features](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/RuntimeEnabledFeatures.md)
* [content layer에서 Blink runtime features 초기화](https://chromium.googlesource.com/chromium/src/+/main/docs/initialize_blink_features.md)
* [origin trials framework와 feature 통합하기](https://chromium.googlesource.com/chromium/src/+/main/docs/origin_trials_integration.md)

[base-commandline]: https://cs.chromium.org/chromium/src/base/command_line.h?type=cs&l=98
[base-feature]: https://cs.chromium.org/chromium/src/base/feature_list.h?sq=package:chromium&g=0&l=53
[about-flags]: https://cs.chromium.org/chromium/src/chrome/browser/about_flags.cc
[fieldtrial-config]: https://cs.chromium.org/chromium/src/testing/variations/fieldtrial_testing_config.json
[flag-metadata]: https://cs.chromium.org/chromium/src/chrome/browser/flag-metadata.json
[prefs]: https://www.chromium.org/developers/design-documents/preferences
[profile-register]: https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/profiles/profile.h;l=189;drc=b0378e4b67a5dbdb15acf0341ccd51acda81c8e0
