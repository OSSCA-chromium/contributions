---
title: 코드 리뷰 가이드
order: 3
group: 가이드
---

CL을 올렸다면 리뷰어의 승인(LGTM)을 받고 CQ를 통과해야 머지됩니다.

### 1. 리뷰어 지정

- 수정한 파일의 상위 디렉터리에 있는 `OWNERS` 파일에서 리뷰어 후보를 찾습니다.
- Gerrit의 **Find Owners** 버튼(돋보기 아이콘)을 누르면 적합한 오너를 자동으로
  추천해 줍니다.
- 리뷰어를 추가한 뒤 **Reply → Send**로 리뷰를 요청해야 리뷰어에게 알림이
  갑니다. 코멘트 없이 리뷰어만 추가하면 요청이 전달되지 않습니다.

### 2. 리뷰 코멘트 대응

- 모든 코멘트에 답을 남기고 **Done** 또는 답변을 단 뒤, 수정 커밋을
  `git cl upload`로 새 패치셋으로 올립니다.
- 리뷰어와 의견이 다르면 근거를 들어 정중히 토론하세요. 리뷰 문화에 대한
  기대치는 [CL author's guide](https://chromium.googlesource.com/chromium/src/+/main/docs/cl_respect.md)와
  [Reviewer's guide](https://chromium.googlesource.com/chromium/src/+/main/docs/cr_respect.md)에
  정리돼 있습니다.
- 시차 때문에 왕복이 하루씩 걸릴 수 있으니, 한 번의 답장에 가능한 한 많은
  코멘트를 묶어 처리하는 편이 효율적입니다.

### 3. 승인과 머지

1. 리뷰어가 **Code-Review +1**(LGTM)을 주면 승인된 것입니다. 수정 범위의 모든
   OWNERS 승인이 필요합니다.
2. **Commit-Queue +2**(CQ)를 누르면 트라이봇이 전체 검증을 돌린 뒤 자동으로
   머지합니다.
3. CQ가 실패하면 실패한 봇의 로그를 확인하고 수정 후 다시 CQ를 겁니다.
   드물게 무관한 테스트가 불안정(flaky)해서 실패하기도 합니다 — 같은 실패가
   재현되지 않으면 재시도해 보세요.

### 4. 머지 이후

- 봇이 회귀(regression)를 감지하면 CL이 revert될 수 있습니다. revert되면
  원인을 수정해 reland CL을 올립니다.
- 머지된 변경이 어떤 릴리스에 포함되는지는
  [Chromium Dash](https://chromiumdash.appspot.com)에서 확인할 수 있습니다.

### 참고 문서

- [Code Reviews](https://chromium.googlesource.com/chromium/src/+/main/docs/code_reviews.md) — 리뷰 정책 전반
- [CL Tips](https://chromium.googlesource.com/chromium/src/+/main/docs/cl_tips.md) — CL을 잘 쪼개고 설명하는 요령
