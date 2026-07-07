---
title: Chromium 코딩 에이전트
order: 38
group: 번역 · agents
description: Chromium 코딩 에이전트 개요
source_path: agents/README.md
source_sha256: ''
translation_status: full
---
> 이 문서는 **Chromium Coding Agents**([`agents/README.md`](https://chromium.googlesource.com/chromium/src/+/main/agents/README.md)) 문서의 한국어 전체 번역입니다.

>[!summary]
>- Chromium 저장소의 AI 코딩 에이전트 관련 디렉터리 설명 문서 전체 번역.



이 디렉터리는 Chromium 소스 트리 안에서 개발에 사용되는 AI 코딩 에이전트(예: `gemini-cli`) 관련 파일을 중앙에서 모아두는 위치를 제공한다.

목표는 개발자들이 사용하는 다양한 환경(Linux, Mac, Windows)과 에이전트 유형을 수용하면서, 프롬프트와 도구를 확장 가능하고 체계적인 방식으로 공유할 수 있게 하는 것이다.

Googler 전용 문서: http://go/chrome-coding-with-ai-agents

## 디렉터리 구조

### 프롬프트

공유 `GEMINI.md` 프롬프트. [`//agents/prompts/README.md`]를 참고한다.

[`//agents/prompts/README.md`]: /agents/prompts/README.md

### 확장과 MCP 서버

Chrome에서 승인한 확장과 MCP 서버. [`//agents/extensions/README.md`]를 참고한다.

사용 가능한 서버를 나열하고 설정하려면 `agents/extensions/install.py`를 사용한다.

[`//agents/extensions/README.md`]: /agents/extensions/README.md

### 스킬

특정 작업을 위한 온디맨드 전문 지식. [`//agents/skills/README.md`]를 참고한다.

[`//agents/skills/README.md`]: /agents/skills/README.md

### 사용자 정의 명령

이 항목들은 [`//.gemini/commands`]에 추가한다.

[`//.gemini/commands`]: /.gemini/commands/README.md

## 기여하기

기존 예시의 형식과 맞는, 독립적으로 사용할 수 있는 작업 프롬프트와 프롬프트 템플릿을 자유롭게 추가해 달라.

새 MCP 서버 설정은 소유자와 지원 주체가 있는 MCP 서버에 대한 것이어야 하며, `OWNERS`를 포함해야 한다.

`common.GEMINI.md` 변경은 폭넓게 사용되는 것을 목적으로 하므로 신중하게 해야 한다.

## 원문

- [raw](https://raw.githubusercontent.com/chromium/chromium/main/agents/README.md)
- [GitHub](https://github.com/chromium/chromium/blob/main/agents/README.md)

---
## History
- 2026-07-05 21:55 최초 생성 (chromium-docs-pkm, 전체 번역)
