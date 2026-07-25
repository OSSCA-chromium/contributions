---
name: Components 분석
about: Chromium components/ 폴더 분석 실습
title: "[components 분석] 이름"
labels: exercise, 2026
assignees: ''

---

## Steps

_각 단계를 완료하면 결과를 **코멘트**로 남기고, 아래 체크박스를 체크해주세요. 이슈 본문은 체크박스 외에는 수정하지 않아도 됩니다._

- [ ] feature 선정 — components/ 밑에 있는 폴더를 하나 선정 (components/{feature})
- [ ] Issue Tracker 확인 — https://issues.chromium.org/ 에서 관련 Component 이름을 찾고 open issue 중 하나 확인
- [ ] Chrome 에서 사용하는 방법 확인 (예: 설정 > ㅇㅇ 메뉴 진입 > 해당 옵션 on > ㅁㅁ 상황에서 확인 가능)
- [ ] 관련 폴더 모두 찾아보기 (chrome, components, content, third_party/blink 이하 세부 폴더)
- [ ] 관련 문서 찾아보기 (components/{feature}, content/{feature} 폴더 등)
- [ ] BUILD.gn, DEPS 파일로 dependency 구조 확인 (관련된 다른 폴더, 참조하는 public 폴더 등)
- [ ] 각 폴더의 주요 클래스를 찾고 어떤 기능을 할지 유추해 보기

---

### 코멘트 양식

_단계별로 아래 양식을 복사해 코멘트로 작성해주세요._

```
**단계**: (예: 관련 폴더 찾아보기)

**결과**
- .
```
