# Chromium 빌드 재시도 스크립트

![에러메세지](https://github.com/OSSCA-chromium/contributions/blob/main/tools/script_for_chromium_build_error/build_error.jpg)

Chromium을 빌드하는데 자꾸 FAILED가 나는 분들을 위한 스크립트입니다.

## 동작 원리

- 빌드에 실패하면 프로그램은 1을 반환하고 종료합니다.
- 빌드에 성공하면 프로그램은 0을 반환하고 종료합니다.

0이 반환될때까지 계속 빌드 명령을 합니다.

## 사용법

1. src폴더로 이동하여 build_chromium.sh를 복사합니다.
2. 빌드 옵션을 수정하고 싶으면 7번째 줄을 수정해줍니다.
3. 콘솔창에 bash build_chromium.sh를 입력합니다.
