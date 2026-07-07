---
title: 첫 CL 올리기
order: 2
group: 가이드
description: Gerrit 계정 설정부터 CL 업로드까지 단계별 안내
---

Chromium은 GitHub PR이 아니라 **Gerrit**의 CL(Change List)로 코드를 리뷰합니다.
처음 CL을 올리기 전에 계정과 서명을 한 번만 설정하면 됩니다.

### 1. 계정 준비 (최초 1회)

1. [Chromium Gerrit](https://chromium-review.googlesource.com/)에 Google 계정으로
   로그인합니다.
2. [CLA(Contributor License Agreement)](https://cla.developers.google.com/)에
   서명합니다. 개인 자격이면 Individual CLA를 선택하세요.
3. Gerrit 설정에서 이메일이 커밋에 사용할 `git config user.email`과 같은지
   확인합니다.
4. `git cl creds-check`로 인증이 잘 되는지 점검합니다.

자세한 내용은 [Gerrit Guide](/contributions/docs/gerrit-guide/)를
참고하세요.

### 2. 브랜치 생성과 커밋

Chromium은 로컬 브랜치 하나가 CL 하나에 대응합니다.

```bash
git checkout -b my-fix origin/main   # 작업 브랜치 생성
# ... 코드 수정 ...
git add <files>
git commit
```

커밋 메시지는 첫 줄에 현재형 동사로 요약을 쓰고, 본문에 변경 이유를 적습니다.
마지막에 `Bug: 40123456` 형태로 이슈 번호를 연결하세요.

```text
Fix crash when parsing empty srcset attribute

An empty srcset caused an out-of-bounds read in
HTMLImageElement::SelectSourceURL. Bail out early instead.

Bug: 40123456
```

### 3. CL 업로드

```bash
git cl upload
```

- 처음 실행하면 커밋 메시지에 `Change-Id`가 자동으로 붙습니다.
- 업로드 후 출력되는 Gerrit URL에서 CL을 확인할 수 있습니다.
- 수정 사항이 생기면 같은 브랜치에서 커밋을 고치고(`git commit --amend`)
  다시 `git cl upload`하면 새 패치셋(patchset)이 올라갑니다.

### 4. 업로드 전 점검

- `git cl format` — 코드 포맷 자동 정리 (clang-format 등).
- `git cl presubmit` — 프리서브밋 검사를 로컬에서 미리 실행.
- Gerrit에서 **CQ Dry Run**(Commit-Queue +1)을 돌리면 트라이봇이 컴파일·테스트를
  검증해 줍니다. 리뷰 요청 전에 한 번 돌려보는 것을 권장합니다.

전체 체크리스트는 [Commit Checklist](/contributions/docs/commit-checklist/)를
참고하세요.

### 다음 단계

리뷰어 지정과 피드백 대응은 [코드 리뷰 가이드](/contributions/docs/code-review-guide/)에서
이어집니다.
