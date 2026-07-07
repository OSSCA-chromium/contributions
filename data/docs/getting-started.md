---
title: 시작하기
order: 1
group: 가이드
description: 빌드부터 머지까지 컨트리뷰션 전체 흐름
---

Chromium 컨트리뷰션은 크게 다섯 단계로 진행됩니다. 이 문서는 전체 흐름을 잡고,
각 단계의 자세한 내용은 이어지는 가이드 문서에서 다룹니다.

1. **체크아웃·빌드** — 소스 코드를 받아 로컬에서 Chromium을 빌드합니다.
2. **이슈 선정** — Issue Tracker에서 도전할 이슈를 고릅니다.
3. **CL 작성** — 코드를 수정하고 Gerrit에 CL(Change List)을 올립니다.
4. **코드 리뷰** — 리뷰어의 피드백을 반영해 승인(LGTM)을 받습니다.
5. **머지** — CQ(Commit Queue)를 통과하면 main에 반영됩니다.

### 1. 소스 체크아웃과 빌드

Chromium은 저장소가 매우 커서 첫 체크아웃과 빌드에 수 시간이 걸릴 수 있습니다.
[depot_tools](https://commondatastorage.googleapis.com/chrome-infra-docs/flat/depot_tools/docs/html/depot_tools_tutorial.html)를
설치한 뒤, 운영체제별 공식 문서를 따라 진행하세요.

- [Linux Build Instructions](/contributions/docs/linux-build-instructions/)
- [Mac Build Instructions](/contributions/docs/mac-build-instructions/)

핵심 명령 흐름은 다음과 같습니다.

```bash
fetch chromium        # 최초 체크아웃 (src/ 생성)
cd src
gclient sync          # 의존성 동기화
gn gen out/Debug    # 빌드 디렉터리 생성
autoninja -C out/Debug chrome   # 빌드
out/Debug/chrome    # 실행 (Linux 기준)
```

빌드 시간을 줄이려면 `gn args out/Debug`에서 다음 옵션을 고려하세요.

```text
is_debug = false          # 릴리스 빌드가 더 빠르게 링크됨
is_component_build = true # 증분 빌드 속도 향상
symbol_level = 0          # 심벌 생략으로 링크 시간 단축
```

### 2. 이슈 선정

- [Chromium Issue Tracker](https://issues.chromium.org/u/1/issues)에서
  `Hotlist-GoodFirstBug` 라벨이 붙은 이슈부터 살펴보세요.
- 관심 컴포넌트가 있다면 해당 컴포넌트로 검색 범위를 좁히는 편이 좋습니다.
- 이슈에 댓글로 작업 의사를 밝히고, 담당자(assignee)가 이미 있는지 확인하세요.

### 3. 코드 수정과 탐색

- [Chromium Code Search](https://source.chromium.org/chromium)로 코드를 탐색하면
  심벌 정의·참조를 빠르게 오갈 수 있습니다.
- 수정 후에는 관련 테스트를 함께 돌려보세요. 예:
  `autoninja -C out/Debug blink_tests` 후 `run_web_tests.py` 실행.

### 다음 단계

- CL을 올리는 절차는 [첫 CL 올리기](/contributions/docs/first-cl/)를 참고하세요.
- 리뷰 과정은 [코드 리뷰 가이드](/contributions/docs/code-review-guide/)를 참고하세요.
