---
title: Chromium AI 코딩 정책
order: 40
group: 번역 · agents
description: Chromium의 AI 도구 사용 정책
source_path: agents/ai_policy.md
source_sha256: ''
translation_status: full
---
> 이 문서는 **Chromium AI Coding Policy**([`agents/ai_policy.md`](https://chromium.googlesource.com/chromium/src/+/main/agents/ai_policy.md)) 문서의 한국어 전체 번역입니다.

>[!summary]
>- Chromium 개발자가 AI 도구로 코드를 작성할 때의 책임과 권장사항 전체 번역.



이 정책은 코드를 작성하는 데 AI 도구를 사용하는 Chromium 개발자를 위한 것이다. 이러한 도구 사용에 관한 기대치를 정리하는 것을 목적으로 한다.

## 책임

작성자는 AI 도구 사용 여부와 관계없이, 리뷰로 보내기 전에 모든 코드 및 문서 업데이트를 **반드시** 스스로 검토하고 이해해야 한다. 이는 변경사항의 정확성, 설계, 보안 속성, 스타일이 프로젝트 기준을 충족하는지 보장하기 위한 것이다. 작성자는 리뷰어가 변경사항에 대해 묻는 질문에 답할 수 있어야 한다. 코드 품질을 넘어서, Chromium은 엄격한 2-커미터 코드 리뷰 요구사항을 가지고 있으며, 작성자가 커미터인 경우 그 작성자는 두 명의 인간 리뷰어 중 한 명으로 간주된다. **계정 뒤의 인간이 실제로 이해하지 못한 CL을 리뷰로 보내는 계정은 커미터 자격을 잃을 위험이 있다. 경고 후 추가 위반이 있으면 해당 계정은 시스템에서 차단될 수 있다.**

리뷰어를 돕기 위해, 작성자는 AI의 도움을 받았고 자신이 확신하지 못하는 영역을 **표시하는 것이 좋다**. 이는 코드 리뷰 댓글, CL 설명, 또는 코드 주석으로 할 수 있다. 자동 생성 코드와 수동 편집을 서로 다른 패치셋으로 분리한 선례가 있다. 예를 들어 패치셋 1에는 자동 변경과 재현 절차를 두고, 패치셋 2 이후에는 수동 편집을 두며, 자동화된 부분을 재현하는 단계도 함께 제공하는 방식이다.

작성자는 AI 도구 사용 여부와 관계없이, 자신이 제출하는 코드가 본인의 독창적 창작물임을 **반드시** 증명/확인해야 한다.

토론(코드 리뷰, 버그, 메일링 리스트 등)에 참여할 때 모든 계정이 따라야 하는 간단한 규칙이 있다. **인간의 답변에는 인간이 답해야 한다.** 따라서 AI 에이전트가 버그를 등록하거나 CL을 만들었고, 인간이 그에 대한 피드백을 남겼다면, 그 피드백에는 해당 에이전트의 인간 운영자가 직접 답해야 한다. 이는 우리 프로젝트의 [행동 강령](https://chromium.googlesource.com/chromium/src/+/main/CODE_OF_CONDUCT.md)에 설명되어 있다.

## 권장사항

작성자는 AI 도구가 CL을 만드는 데 어떻게 사용되었는지 CL 설명이나 코드베이스 자체에 설명할 **수 있다**.

예시:

- 하나의 도구(예: gemini-cli)에 단일 프롬프트를 입력해 CL을 만들었다면, 그 프롬프트를 CL 설명에 포함할 수 있다.
- 설계 스펙을 프롬프트와 함께 도구의 입력으로 제공했고 그 도구가 동작하는 변경사항을 만들었다면, 해당 스펙을 코드와 함께 체크인하고 프롬프트를 CL 설명에 포함할 수 있다.

gemini-cli에 대한 추가 예시는 `//agents/prompts/eval`에 추가할 수 있으며, 이는 공통 시스템 프롬프트 개선을 위한 평가 사례로 쓰이게 된다.

## Google 직원

추가 요구사항은 go/chrome-internal-ai-policy를 참고한다.

## 원문

- [raw](https://raw.githubusercontent.com/chromium/chromium/main/agents/ai_policy.md)
- [GitHub](https://github.com/chromium/chromium/blob/main/agents/ai_policy.md)

---
## History
- 2026-07-05 21:55 최초 생성 (chromium-docs-pkm, 전체 번역)
