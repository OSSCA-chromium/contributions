---
title: Blink Spec MCP 서버
order: 41
group: 번역 · agents
description: Blink 스펙 MCP 서버 사용법
source_path: agents/extensions/blink-spec/README.md
source_sha256: ''
translation_status: full
---
> 이 문서는 **Blink Spec MCP Server**([`agents/extensions/blink-spec/README.md`](https://chromium.googlesource.com/chromium/src/+/main/agents/extensions/blink-spec/README.md)) 문서의 한국어 전체 번역입니다.

>[!summary]
>- Blink spec 관련 MCP 서버 설치/설정/사용법 문서 전체 번역.



이 MCP 서버는 gemini-cli가 특정 이슈의 GitHub 댓글을 가져올 수 있게 한다. 또한 spec 본문에서 이슈가 위치한 GitHub URL로 매핑할 수 있게 한다.

## 설치

```bash
$ agents/extensions/install.py add blink-spec
```

## 설정

GitHub API를 사용하려면, 이 확장을 설치하는 각 사용자가 개인 액세스 토큰을 만들어야 한다.

직접 링크: https://github.com/settings/personal-access-tokens 또는 다음 절차를 따른다.

- GitHub에서 오른쪽 위의 아바타를 클릭한다.
- `Settings`를 클릭한다.
- `Developer Settings`를 클릭한다.
- `Personal access tokens` 아래에서 `Fine-grained tokens`로 이동한다.
- 토큰을 만들고 어딘가에 저장한다.
  - 일부 그룹(w3c)은 토큰 만료 기간이 366일보다 짧아야 한다는 점에 유의한다.
  - Issues와 Pull Requests에 대해서는 최소한 읽기 전용 접근 권한이 필요하다는 점에 유의한다.

gemini를 실행하기 전에 액세스 토큰을 `BLINK_SPEC_GITHUB_API_KEY` 환경변수로 추가한다.

```bash
$ echo "export BLINK_SPEC_GITHUB_API_KEY=your_key" >> ~/.bashrc
$ source ~/.bashrc
```

## 사용법

샘플 질의(gemini-cli를 시작한 뒤):

```text
> summarize css spec issue 12336
```
