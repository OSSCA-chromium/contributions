---
title: 코드 리뷰
order: 22
group: 번역 · docs
description: 코드 리뷰 정책과 OWNERS 제도
source_path: docs/code_reviews.md
source_sha256: 305c885f530df85ae35e223ca55321172a400ae9bc2076b5962cfa21d79bd6b5
translation_status: full
---
> 이 문서는 **Code Reviews**([`docs/code_reviews.md`](https://chromium.googlesource.com/chromium/src/+/main/docs/code_reviews.md)) 문서의 한국어 전체 번역입니다.

코드 리뷰는 Chromium을 위한 고품질 코드를 개발하는 데 핵심적인 부분이다.
모든 변경 목록(CL)은 반드시 리뷰되어야 한다.

이 페이지는 코드 변경과 관련된 정책 규칙을 문서화한다.

함께 보기:
- [코드 기여](https://chromium.googlesource.com/chromium/src/+/main/docs/contributing.md#code-review)의 일반적인 패치, 업로드, 랜드 절차
- [행동 강령](https://chromium.googlesource.com/chromium/src/+/main/CODE_OF_CONDUCT.md)
- [존중하는 변경](https://chromium.googlesource.com/chromium/src/+/main/docs/cl_respect.md)
- [존중하는 코드 리뷰](https://chromium.googlesource.com/chromium/src/+/main/docs/cr_respect.md)
- 2021년 3월 24일에 시작된 코드 리뷰 변경 사항 및 OWNERS 정책 변경 사항은
[필수 코드 리뷰 및 네이티브 OWNERS](https://chromium.googlesource.com/chromium/src/+/main/docs/code_review_owners.md)를 참조하라.

# 코드 리뷰 정책

모든 [커미터](https://www.chromium.org/getting-involved/become-a-committer/#what-is-a-committer)는 코드를 리뷰할 수 있지만,
당신이 건드리는 각 디렉터리에 대해 owner가 리뷰를 제공해야 한다. 이상적으로는 당신이 건드리는 코드 영역에 익숙한
리뷰어를 선택해야 한다. 의심스러우면 해당 파일의 `git blame`과 `OWNERS` 파일을 살펴보라([추가 정보](#owners-파일)).

긍정적인 리뷰를 표시하기 위해 리뷰어는 Gerrit에서 `Code-Review +1`을 제공한다. 이는 LGTM("Looks Good To Me")이라고도 한다.
"-1" 점수는 변경을 현재 상태 그대로 제출해서는 안 된다는 뜻이다.

Chromium 커미터가 아닌 변경 기여자가 chromium/src 저장소에 제출하는 경우, 두 명의 커미터가 제출물에 Code-Review+1을 해야 한다.
CL의 owner가 이미 커미터라면, 리뷰에는 다른 커미터 한 명만 필요하다.

리뷰어가 여러 명이라면, 각 리뷰어에게 무엇을 기대하는지 나타내는 메시지를 제공하라. 그렇지 않으면 사람들은 자신의 의견이 필요하지 않다고
가정하거나 중복 리뷰에 시간을 낭비할 수 있다.

[존중하는 변경](https://chromium.googlesource.com/chromium/src/+/main/docs/cl_respect.md)과
[존중하는 코드 리뷰](https://chromium.googlesource.com/chromium/src/+/main/docs/cr_respect.md)도 읽어 달라.

생산적인 리뷰를 위한 [팁 모음](https://chromium.googlesource.com/chromium/src/+/main/docs/cl_tips.md)도 있지만,
이는 권고 사항이며 정책은 아니다.

#### 모든 리뷰어에 대한 기대 사항

*   리뷰어로서, 근무일마다 3회 실행 가능한 피드백을 제공하는 것을 목표로 하라.
    기대 사항은 CL 작성자와 같은 시간대에 있다면 리뷰 반복이 3회 이루어지는 것이다.
    시간대 차이가 있다면 리뷰 반복 2회를 목표로 하라.

*   자리를 비웠는지와 언제 돌아올지를 나타내기 위해 Gerrit 설정의 "Display name" 및 "About me" 필드를 사용하라.

*   일반적으로 사람들이 당신에게 코드 리뷰를 보내는 것을 단념시키지 말라. 여기에는 "Display name" 또는 "About me" 필드에
    포괄적인 "slow"를 사용하는 것도 포함된다.

#### 모든 작성자에 대한 기대 사항

*   리뷰어가 2근무일 이내에 응답하지 않으면 CL에 다른 리뷰어를 추가하라.
    최초 리뷰어를 제거하지 말라.

## OWNERS 파일

여러 디렉터리에는 해당 디렉터리의 변경 사항을 리뷰할 자격이 있는 사람들의 이메일 주소를 나열하는 `OWNERS`라는 이름의 파일이 있다.
당신은 변경이 건드리는 각 디렉터리의 owner에게서 긍정적인 리뷰를 받아야 한다.

Owners 파일은 재귀적으로 적용되므로, 각 파일은 그 하위 디렉터리에도 적용된다.
일반적으로 더 구체적인 owner를 선택하는 것이 가장 좋다. 상위 수준 디렉터리에 나열된 사람들은 문제의 코드에 대한 경험이 적을 수 있다.
예를 들어, `//chrome/browser/component_name/OWNERS` 파일의 리뷰어는 상위 수준 `//chrome/OWNERS` 파일의 리뷰어보다
`//chrome/browser/component_name/sub_component`의 코드에 더 익숙할 가능성이 높다.

Owners 파일 형식에 대한 자세한 내용은 [여기](#owners-파일-세부-사항)에 제공되어 있다.

*팁:* `git cl owners` 명령은 owner를 찾는 데 도움이 될 수 있다. Gerrit도 CL의 Reviewers 필드에서
이 기능을 제공한다.

Owner는 모든 패치를 승인해야 하지만, 모든 커미터가 리뷰에 기여할 수 있다.
일부 디렉터리에서는 owner들이 과부하 상태일 수 있거나, owner로 나열되어 있지는 않지만 문제의 저수준 코드에 더 익숙한 사람들이 있을 수 있다.
이러한 경우 적절한 사람에게 저수준 리뷰를 요청한 다음, 그것이 완료되면 상위 수준 owner 리뷰를 요청하는 것이 일반적이다.
언제나 그렇듯이, 중복 작업을 피하기 위해 각 리뷰어에게 무엇을 기대하는지 명확히 하라.

Owner는 리뷰를 위해 다른 owner를 선택할 필요가 없다. 그들은 이미 문제의 코드에 익숙해야 하므로, 적절한 커미터의 철저한 리뷰면 충분하다.

#### Owner에 대한 기대 사항

디렉터리의 기존 owner들이 목록에 추가하는 것을 승인한다. 많은 owner가 있는 큰 디렉터리보다는,
각각 더 적은 수의 구체적인 owner를 가진 많은 디렉터리를 두는 것이 바람직하다. Owner는 최소 3개월의 재직 기간을 가진
[커미터](https://www.chromium.org/getting-involved/become-a-committer/)여야 하며, 추가로 다음을 충족해야 한다.

  * 뛰어난 판단력, 팀워크, 그리고 [Chromium 개발 원칙](https://chromium.googlesource.com/chromium/src/+/main/docs/contributing.md)을 지킬 수 있는 능력을 보여준다.

  * 이미 owner처럼 행동하며, 고품질 리뷰와 설계 피드백을 제공하고 있다.

  * 영향을 받는 디렉터리에 상당한 수의 사소하지 않은 변경을 제출했다.

  * 지난 90일 이내에 영향을 받는 디렉터리에 상당한 작업을 커밋했거나 리뷰했다.

  * 적시에 리뷰에 기여할 수 있는 여력이 있다. 부담이 지속 불가능하다면 owner 수를 늘리기 위해 노력하라.
    이름 뒤에 "slow" 또는 "emeritus"를 쓰는 것을 포함하여, 사람들이 리뷰를 보내는 것을 단념시키려 하지 말라.

거의 업데이트되지 않는 디렉터리는 "상당성" 및 "최근성" 요구 사항에 예외가 있을 수 있다.

`//third_party`의 디렉터리는 코드가 얼마나 자주 업데이트되는지와 관계없이 해당 라이브러리에 가장 익숙한 사람들을 나열해야 한다.

#### 새 OWNERS 추가

새 OWNERS는 기존 OWNERS의 합의로 추가된다.

일부 디렉터리는 OWNERS 파일을 업데이트하기 위한 더 잘 정의된 절차를 가지고 있으며, 이는 OWNERS 파일 자체의 맨 위에 문서화되어 있다
(예: [blink/renderer/](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/OWNERS)).

OWNERS 파일을 수정하는 CL은 인지를 위해 다른 모든 OWNERS를 cc해야 하며(다른 인지 메커니즘이 존재하지 않는 한),
변경이 랜드된 후에도 우려가 제기될 수 있다. 모든 의견 불일치는 상위 수준 디렉터리 OWNERS 또는 최상위
[ATL_OWNERS](https://chromium.googlesource.com/chromium/src/+/main/ATL_OWNERS)로 에스컬레이션해야 한다.

#### Owner 제거

코드 owner가 위에 나열된 [owner에 대한 기대 사항](#owner에-대한-기대-사항)을 한 분기 넘게 충족하지 못하고
(그 기간 동안 휴직 중이 아니라면), 공동 owner 또는 상위 디렉터리의 owner가 4주 통지 후 다음 절차를 사용하여 제거할 수 있다.

  * owner를 제거하는 변경을 업로드하고, 해당 디렉터리의 모든 owner를 복사한다. 여기에는 문제의 owner도 포함된다.
  * 영향을 받는 owner가 변경을 승인하면 즉시 랜드될 수 있다.
  * 그렇지 않으면 변경 작성자는 다른 owner들의 피드백을 위해 5근무일을 기다려야 한다.
    * 그 시간이 지난 후, 변경이 다른 누구의 반대도 없이 3개의 승인을 받았다면 변경은 랜드될 수 있다.
    * 디렉터리에 owner가 4명 없으면, 충분한 표를 제공하기 위해 필요에 따라 상위 디렉터리(또는 디렉터리들)의 owner에게
      결정을 에스컬레이션해야 한다.
    * 반대가 있으면, 결정을 해결을 위해 [ATL_OWNERS](https://chromium.googlesource.com/chromium/src/+/main/ATL_OWNERS)로 에스컬레이션해야 한다.

참고: 코드 리뷰를 늦추지 않기 위해 Chromium은 비활성 owner(예: 여러 분기 동안 기여가 없는 사람)를 정기적으로 제거한다.
스크립트는 장기 휴직 같은 개인적 상황을 고려하지 않는다. 장기 휴직 중 특정 기간에만 비활성 상태였고 다른 때에는 위의 owner 기대 사항을
충족해 왔다면, 자신을 다시 추가하는 CL을 만들고 로컬 owner의 승인을 받은 후 랜드할 수 있다(해당 CL에서 이 정책을 참조할 수 있다).
제거 스크립트는 스팸을 피하기 위해 제거된 owner와 다른 owner 한 명을 cc한다.

### OWNERS 파일 세부 사항

파일 형식에 대한 모든 세부 사항은 [owners 플러그인](https://github.com/GerritCodeReview/plugins_code-owners/blob/master/resources/Documentation/backend-find-owners.md)을 참조하라.

이 예시는 상위 디렉터리의 모든 owner에 더해 두 사람이 owner임을 나타낸다. `git cl owners`는 owner 주소 뒤의 주석을 나열하므로,
이곳은 제한 사항이나 특별 지침을 포함하기에 좋은 위치다.
```
# You can include comments like this.
a@chromium.org
b@chromium.org  # Only for the frobinator.
```

`*`는 모든 커미터가 owner임을 나타낸다.
```
*
```

`set noparent`라는 텍스트는 상위 디렉터리로부터의 owner 전파를 중단한다.
이는 드물게 사용해야 한다. IPC 관련 파일을 제외하고 `set noparent`를 사용하고 싶다면, 먼저 chrome-atls@google.com에 연락하라.

주어진 사용 사례에 대한 owner를 나열하는 파일에 대한 참조와 함께 `set noparent`를 사용해야 한다.
승인된 사용 사례는 `//build/OWNERS.setnoparent`에 나열되어 있다. 해당 파일에 나열된 owner들은 ATL 리뷰 또는 ipc 보안 리뷰와 같은
특별한 거버넌스 기능을 수행할 것으로 기대된다. 모든 owner 집합은 구성원 자격을 감사하는 자체 수단을 구현해야 한다.
최소 기대 사항은 해당 파일의 구성원 자격이 프로젝트 또는 소속 변경 시 재평가되는 것이다.

이 예시에서는 ATL만 owner다.
```
set noparent
file://ATL_OWNERS
```

`per-file` 지시문은 패턴과 일치하는 파일에만 적용되는 owner를 추가할 수 있게 한다.
이 예시에서는 상위 디렉터리의 owner가 적용되고, 일부 파일 클래스에 대해 한 사람이 추가되며, readme에 대해서는 모든 커미터가 owner다.
```
per-file foo_bar.cc=a@chromium.org
per-file foo.*=a@chromium.org

per-file readme.txt=*
```

다른 `OWNERS` 파일은 `file://...`과 함께 파일 경로를 나열하여 참조로 포함할 수 있다.
이 예시는 `//ipc/SECURITY_OWNERS`에 나열된 사람들만 messages 파일을 리뷰할 수 있음을 나타낸다.
```
per-file *_messages*.h=set noparent
per-file *_messages*.h=file://ipc/SECURITY_OWNERS
```

파일 글로빙은 [단순 경로 표현식](https://github.com/GerritCodeReview/plugins_code-owners/blob/master/resources/Documentation/path-expressions.md#simple-path-expressions)
형식을 사용하여 지원된다.

주석에 `#{LAST_RESORT_SUGGESTION}`이 붙은 owner는 코드 owner를 제안할 때 생략된다.
단, 이러한 코드 owner를 제외하면 제안 결과가 비게 되거나, 이러한 코드 owner가 이미 변경의 리뷰어인 경우는 예외다.

### Owners-Override

`Owners-Override +1` 라벨을 설정하면 OWNERS 강제가 우회된다. 활성 [gardener](https://chromium.googlesource.com/chromium/src/+/main/docs/gardener.md), Release Program Manager,
[대규모 변경](#large-scale-changes),
[Global Approver](#global-approvals) 리뷰어,
[Chrome ATL](https://chromium.googlesource.com/chromium/src/+/main/ATL_OWNERS)은
이 기능을 가진다. Owners-Override를 사용할 권한은 다음과 같이 제한되어야 한다.

  * 활성 gardener와 Release Program Manager는 gardening 및 release에 필요한 CL(예: revert, reland, test fix,
    cherry-pick)에 대해서만 Owners-Override를 설정할 수 있다.
  * Large Scale Change 리뷰어는 gardening CL과 승인된 Large Scale Change에 관한 CL에 대해서만 Owners-Override를 설정할 수 있다.
  * Global approver는 gardening CL과 자신의 API 변경과 관련된 기계적 CL에 대해서만 Owners-Override를 설정할 수 있다.
    예를 들어, //base/OWNERS는 //base/ API 변경과 관련된 기계적 CL에 Owners-Override를 설정할 수 있다.
  * Chrome ATL은 위 그룹들이 처리할 수 없는 사례를 돕고 LSC가 너무 무거운 경우 CL을 신속히 처리하기 위해 모든 변경에 Owners-Override를 설정할 수 있다.
    그러나 Chrome ATL에게 요청하기 전에 위 그룹 중 하나를 사용하라.

Gardening CL에 Owners-Override가 필요할 때는 먼저 Active Sheriff와 Release Program Manager에게 연락하라.
그들 중 아무도 가능하지 않다면 lsc-owners-override@chromium.org로 이메일을 보내 도움을 요청하라.

Owners-Override 자체만으로는 자신의 CL에 충분하지 않다는 점에 유의하라. 이것이 중요한 경우는 gardening을 할 때다.
예를 들어, 테스트를 revert하거나 비활성화하려는 경우 CL에 대한 당신의 Owners-Override만으로는 충분하지 않다.
또 다른 커미터가 CL에 LGTM을 제공하거나, clean revert의 경우 [rubber-stamper bot](#자동-코드-리뷰)의
`Bot-Commit: +1`도 필요하다.

Owners-Override를 설정할 때는 패치의 모든 파일(및 줄)이 적절하게 리뷰되었음을 확인하는 것이 당신의 책임이다.

## 기계적 변경

### Global Approvals
일회성 CL의 경우, `base`, `build`, `content`, `third_party/blink/public`, `url`의 API owner는 영향을 받는 디렉터리 owner의
rubberstamp +1을 기다리지 않도록 자신의 API에 대한 변경에 `Owners-Override +1`을 할 수 있다.
이는 기계적 업데이트에만 사용해야 하지만, global approver는 자신이 충분히 이해하여 승인할 수 있는 기계적 변경을 판단할 때 자유롭게 판단할 수 있다
(자신이 소유한 코드로의 호출로 엄격히 제한하기보다).

많은 디렉터리에 영향을 주지만 리뷰에 영역별 전문 지식이 필요하지 않은 변경의 경우, 더 많은 수의 리뷰어에게 불필요한 리뷰 비용을 발생시키기보다
임의의 global approver 또는 Chrome ATL에게 변경 승인을 요청하라.

### Large Scale Changes
리팩터링, 아키텍처 변경, 또는 전체 코드베이스에 걸친 기타 반복적인 코드 변경과 같은 큰 변경에 대해 OWNERS 강제를 우회하는 승인을 받기 위해
[대규모 변경](https://chromium.googlesource.com/chromium/src/+/main/docs/process/lsc/large_scale_changes.md) 절차를 사용할 수 있다. 이는 수십 개의 CL에 걸친 작업에 사용된다.

## 문서 업데이트

문서 업데이트에는 코드 리뷰가 필요하다. 우리는 향후 이 결정을 재검토할 수 있다.

## 자동 코드 리뷰

번역 파일, clean revert, clean cherry-pick처럼 검증 가능하게 안전한 변경의 경우, 인간 코드 리뷰 없이 CL을 제출할 수 있도록
`Bot-Commit` 라벨에 +1을 투표하는 자동화가 있다. 이 자동화를 활성화하려면 CL에 `Rubber Stamper`
(rubber-stamper@appspot.gserviceaccount.com)를 리뷰어로 추가하라. 약 1분 후 CL을 스캔하고 판정을 회신한다.
`Bot-Commit` 투표는 패치셋 간에 고정되지 않으므로 CL이 확정된 뒤에만 봇을 추가하라.

[`Owners-Override`](#owners-override) 권한과 결합하면 gardener는 실질적으로 스스로 revert하고 reland할 수 있다.

Rubber Stamper는 설계상 OWNERS 승인을 제공하지 않는다. 이는 수정된 디렉터리에 owner를 가진 사람이나 gardener가 사용하도록 의도되었다.
만약 코드 리뷰와 OWNERS 승인을 모두 제공한다면, 이는 남용 벡터가 될 것이다. 즉 revert나 cherry-pick을 만들 수 있는 누구나 다른 사람이 전혀 관여하지 않고
그것을 랜드할 수 있게 된다(예: 보안 패치의 조용한 revert).

`Rubber Stamper`가 지원하지 않는 변경에는 항상 다른 커미터의 +1이 필요하다.
