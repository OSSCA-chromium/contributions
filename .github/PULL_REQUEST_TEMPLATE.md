## Summary

<!-- 무엇을 왜 바꿨는지 1~3줄로 적어주세요 -->

## 관련 이슈

<!-- 관련 GitHub 이슈 번호 (예: #188). 없으면 "없음" -->

## Checklist

<!-- 해당하는 유형의 체크리스트만 남기고 나머지는 지워주세요 -->

### 기여 기록 (`data/contributions/**`)

[기여 기록하기 가이드](https://ossca-chromium.github.io/contributions/docs/contribution-record/)를 따라 작성했는지 확인해 주세요.

- [ ] 파일명이 `{ChromiumReviewId}.md` 형식이다
- [ ] 템플릿 안내 주석(`# github.com/GitHubId` 등)과 `https://example.com` placeholder를 모두 지웠다
- [ ] `npm run validate:data`, `npm run lint:md`가 통과한다
- [ ] 커밋 메시지가 `contributions:` prefix를 사용한다 (예: `contributions: Add 6520751`)
- [ ] frontmatter의 `status`가 현재 CL 상태와 일치한다 (`in review` / `merged`)

### 사이트 코드·문서·기타 데이터

- [ ] `npm test`, `npm run lint`, `npm run build`가 통과한다
- [ ] 커밋 메시지 prefix가 [CONTRIBUTING.md](https://github.com/OSSCA-chromium/contributions/blob/main/CONTRIBUTING.md) 규칙과 일치한다
