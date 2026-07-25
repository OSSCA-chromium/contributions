---
title: Chrome 릴리스 주기
order: 35
group: 번역 · docs/process
description: Chrome 4주 릴리스 주기
source_path: docs/process/release_cycle.md
source_sha256: 867b3cf079a66778995b1b37f25f95377bdfdbbc9a6d564e448d05961c04f0fd
translation_status: full
---
> 이 문서는 **Chromium Release Cycle**([`docs/process/release_cycle.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/process/release_cycle.md)) 문서의 한국어 전체 번역입니다.

## 개요

Chrome은 4주마다 stable 채널에 새 마일스톤(주 버전)을 출시한다. 새 마일스톤은 해당 마일스톤의 브랜치가 잘리기 전까지 main에서 4주 동안 개발되며(이전 마일스톤의 브랜치 포인트부터 시작), 이후 브랜치는 stable로 출시되기 전까지 4주 동안 안정화된다. 마일스톤이 stable에 도달하면, 보안 수정 사항을 배포하고 Chrome의 [패치 갭](https://groups.google.com/a/chromium.org/g/security-dev/c/fbiuFbW07vI)을 짧게 유지하기 위해 stable에 주간 업데이트(리프레시라고 부름)가 출시된다.

## Extended Stable

Chrome Browser는 또한 중요한 보안 수정 사항을 백포트하여 extended stable 채널을 만들기 위해, 한 마일스톤 건너 하나씩 마일스톤 브랜치를 4주 더 유지한다. 이 채널에서는 새 마일스톤이 8주마다 출시된다. 이 마일스톤의 첫 4주 동안 stable과 extended stable은 동일한 릴리스를 출시한다. 자세한 내용은 [채널 수명 주기](#채널-수명-주기)를 참조하라. extended stable 채널은 Windows 및 Mac 플랫폼의 기업에만 제공되며, 엔터프라이즈 정책을 통해 활성화할 수 있다. extended stable에는 격주 리프레시가 출시된다.

extended stable은 Windows와 Mac에만 출시되지만, 어떤 Chrome Browser 플랫폼에든 관련되는 보안 수정 사항은 임베더가 사용할 수 있도록 extended stable 브랜치에 랜딩된다. 팀은 모든 중요한 보안 수정 사항을 extended stable에 백포트하기 위해 노력하겠지만, 복잡하고 위험한 변경 사항뿐 아니라 보안을 개선하는 더 큰 기능(예: [Site Isolation](https://www.chromium.org/Home/chromium-security/site-isolation))은 백포트가 가능하지 않을 수 있으며 stable 채널에서만 사용할 수 있다는 점이 중요하다. 따라서 보안이 주요 관심사인 모든 팀에는 stable 채널과 stable 브랜치를 사용하는 것이 권장된다.

## 릴리스 주기
아래 다이어그램은 마일스톤이 릴리스 주기를 거치는 동안 서로 다른 개발 체크포인트가 언제 발생하는지 보여준다.

![릴리스 주기](https://raw.githubusercontent.com/chromium/chromium/main/docs/process/images/release_cycle.png)

* 각 마일스톤의 주요 개발 기간(4주)은 위에 묘사되어 있지 않지만, 아래 [채널 수명 주기](#채널-수명-주기)에서는 볼 수 있다.
* 각 마일스톤의 개발 체크포인트별 구체적인 날짜는 [릴리스 캘린더](https://chromiumdash.appspot.com/schedule)에서 찾을 수 있다.
* 일부 날짜는 플랫폼마다 달라질 수 있다. 각 플랫폼의 구체적인 날짜는 릴리스 캘린더를 참조하라.
* 브랜치 포인트 날짜는 고정되어 있지만, 릴리스 날짜는 다양한 요인(예: 막판에 발견된 회귀)에 따라 변경될 수 있다.
* 문제가 발생했을 때 적절한 대응 범위를 보장하기 위해 주요 휴일 전후에는 stable에 새 마일스톤을 출시하지 않도록 릴리스 날짜가 조정된다. 이러한 조정은 이미 릴리스 일정에 반영되어 있다.

### 브랜치 포인트

브랜치 포인트에서 생성된 일일 canary가 만든 브랜치는 마일스톤 브랜치로 지정되며, 이후 4주 동안 안정화된다.

브랜치 포인트 이전:

1.  이 마일스톤에서 출시할 계획인 모든 새 기능은 코드 완료 상태여야 한다(모든 주요 기능이 구현되어 있어야 함). 브랜치 포인트까지 코드 완료 상태가 아닌 기능은 다음 마일스톤으로 미뤄야 한다.
2.  모든 문자열이 랜딩되어 있어야 한다.
3.  모든 beta 차단 버그가 해결되어 있어야 한다.

브랜치 포인트 전후에 코드를 랜딩할 때는 [이 가이드라인](https://chromium.googlesource.com/chromium/src/+/main/docs/release_branch_guidance.md)을 고려하라.

### Beta 승격

브랜치 직후, 새 마일스톤은 처음으로 beta 채널에 출시된다. 이후 추가로 3주 동안 매주 새 빌드가 beta에 출시되어, 릴리스가 beta 채널에서 총 4주를 보내게 된다.

### Early Stable 컷

Early Stable 컷은 early stable 릴리스 후보 빌드가 생성되는 날이다. 이 빌드는 사용자 피드백을 수집하기 위해 stable 채널 사용자 중 소수에게 출시된다. 모든 stable 차단 이슈는 early stable 컷까지 수정되어야 한다.

### Early Stable 승격

새 마일스톤은 처음으로 stable 채널 사용자 중 소수에게 출시된다.

### Stable 컷

Stable 컷은 stable 릴리스 후보 빌드가 생성되는 날이다. stable 컷 이후에 랜딩되는 변경 사항은 stable 릴리스에 포함될 수도 있고 포함되지 않을 수도 있다.

### Stable 승격

beta 채널에서 4주를 보낸 뒤, 새 마일스톤은 처음으로 stable 채널에 출시된다. 출시는 시간이 지나며 단계적으로 진행되어, 초기에 발생하는 문제가 모든 사용자에게 도달하기 전에 해결될 수 있도록 한다. 빠르게 해결할 수 없는 주요 문제가 발생하지 않는 한, 새 릴리스는 일반적으로 1~2주 내에 모든 사용자에게 도달한다.

단계적 출시를 위한 더 나은 통계 데이터를 얻기 위해, 각 출시는 빌드 번호를 제외하고는 동일한 두 개의 별도 빌드로 구성된다. 더 낮은 빌드 번호를 사용해도 해가 없으며, 모든 사용자는 출시 프로세스의 일부로 더 높은 빌드 번호로 자동 업데이트될 것으로 예상된다.

### Stable 리프레시

stable 채널은 매주 리프레시되며, extended stable 채널은 2주마다 리프레시된다. 이러한 리프레시는 일반적으로 중요한 보안 수정 사항뿐 아니라 릴리스 팀의 재량에 따라 제공될 수 있는 긴급 회귀 수정 사항을 포함한다.

## 채널 수명 주기

아래 다이어그램은 서로 다른 마일스톤이 Chrome의 서로 다른 릴리스 채널을 어떻게 거치는지 보여준다.

![채널 수명 주기](https://raw.githubusercontent.com/chromium/chromium/main/docs/process/images/channel_diagram.png)

* 위에서 언급했듯이, stable과 extended stable은 수명의 첫 4주 동안 동일한 버전을 출시하며, 그 이후 두 채널은 갈라진다.
* extended beta 채널은 없다. 대신 표준 4주 beta 주기가 stable과 extended stable을 모두 안정화하는 데 사용된다. 8주 extended stable을 선택하는 기업은 자신의 환경에 영향을 줄 수 있는 문제를 사전에 식별하기 위해, 현재와 마찬가지로 beta 채널을 계속 실행해야 한다.

## 마일스톤 브랜치 지원

아래 다이어그램은 각 마일스톤 브랜치의 수명을 보여준다.

![마일스톤 브랜치 지원](https://raw.githubusercontent.com/chromium/chromium/main/docs/process/images/branch_diagram.png)

마일스톤 브랜치가 활성 상태인 동안 브랜치 인프라(예: 브랜치 CQ)는 활성 상태로 유지되며, 중요한 보안 수정 사항은 백포트 대상으로 고려된다. 현재 활성 브랜치와 각 브랜치의 해당 채널을 설명하는 엔드포인트가 검토 중이며, 만들어진다면 새 extended stable 채널 및 4주 릴리스 주기의 출시 전에 제공될 것이다.
