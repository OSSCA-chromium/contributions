---
title: "Gerrit 에 올린 commit 제목을 입력하세요"
date: YYYY-MM-DD # Gerrit CL upload date
author: GitHubId # github.com/GitHubId
contribution_url: https://crrev.com/c/XXXXX # Add XXXXX from https://chromium-review.googlesource.com/c/chromium/src/+/XXXXX
module: directory/name # Chromium module or directory
kind: fix # fix, feature, refactor, test, docs, cleanup, etc.
keywords: ["keyword1", "keyword2"] # Additional search terms
status: in review # Change to merged or abandoned after the Gerrit result is confirmed
# resolvedDate: YYYY-MM-DD # Add only when the exact Gerrit result date is verified
# externalLinks:
#   - title: "WPT PR #12345"
#     url: https://github.com/web-platform-tests/wpt/pull/12345
---

간략한 소개 문장을 작성하세요. 이 컨트리뷰션이 무엇에 관한 것인지 설명합니다.

## 문제 설명

해결하려는 문제나 개선하려는 부분에 대해 설명하세요.

- 문제점 1
- 문제점 2
- 문제의 배경이나 맥락

## 해결 내용

어떻게 문제를 해결했는지 설명하세요.

abandoned 상태라면 시도한 접근 방법과 변경을 중단한 이유를 작성하세요.

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

## 관련 이슈와 외부 PR

이 기여에서 파생된 이슈와 PR은 `externalLinks`에 제목과 HTTPS URL로 수집합니다.
WPT 자동 export, 직접 등록한 crbug·WPT·W3C·WHATWG·Khronos 이슈,
후속 테스트 PR 등을 원본 기여에 연결하며 별도 기여로 중복 집계하지 않습니다.

- WPT export는 Gerrit의 변경 파일과 export 댓글, upstream PR을 대조합니다.
- 직접 등록한 이슈와 PR은 원문에서 등록자·작성자를 확인합니다.
- 외부 프로젝트에 독립적으로 진행한 PR은 별도 contribution으로 기록하고
  `repo`와 실제 PR URL을 지정합니다.

## 배운 점

이 컨트리뷰션을 통해 배운 점을 공유하세요.

- 기술적 학습
- 프로세스 관련 학습
- 향후 개선 방향

## 참고 자료

- [관련 문서 링크](https://example.com)
- [참고한 소스 코드](https://example.com)
