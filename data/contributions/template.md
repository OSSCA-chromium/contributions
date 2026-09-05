---
title: "Gerrit 에 올린 commit 제목을 입력하세요"
date: YYYY-MM-DD # merged/abandoned로 확정된 날짜
author: GitHubId # github.com/GitHubId
contribution_url: https://crrev.com/c/XXXXX # crrev 단축 URL 권장
status: merged # merged, abandoned 중 하나 선택
module: base # 패치가 속한 Chromium 모듈/디렉토리 1개
kind: fix # 변경 종류 1개 (예: fix, feature, refactor, test, docs, cleanup)
# --- 아래는 선택 항목: 해당할 때만 남기고 아니면 줄을 지우세요 ---
# repo: devtools/devtools-frontend # chromium/src가 아닐 때만
# issue: 42 # 이 저장소의 과제 이슈 번호
# crbug: 538651940 # 관련 crbug ID (commit message의 Bug: 푸터)
# related: [8146041] # 관련 패치의 리뷰 ID 목록
---

간략한 소개 문장을 작성하세요. 이 컨트리뷰션이 무엇에 관한 것인지 설명합니다.

## 문제 설명

해결하려는 문제나 개선하려는 부분에 대해 설명하세요.

- 문제점 1
- 문제점 2
- 문제의 배경이나 맥락

## 해결 내용

어떻게 문제를 해결했는지 설명하세요.

1. 첫 번째 접근 방법
2. 구현 세부 사항
3. 주요 코드 변경 내용

```cpp
// 코드 예제가 있다면 추가하세요
void SampleFunction() {
  // 주요 변경 내용
}
```

## 테스트 방법

구현한 내용을 어떻게 테스트했는지 설명하세요.

1. 단위 테스트
2. 통합 테스트
3. 성능 테스트 결과

## 배운 점

이 컨트리뷰션을 통해 배운 점을 공유하세요.

- 기술적 학습
- 프로세스 관련 학습
- 향후 개선 방향

## 참고 자료

- [관련 문서 링크](https://example.com)
- [참고한 소스 코드](https://example.com)
