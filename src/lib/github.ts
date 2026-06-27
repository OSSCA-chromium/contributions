// 서버 전용 모듈(fs)에 의존하지 않는 순수 헬퍼.
// 클라이언트 컴포넌트에서도 안전하게 import 할 수 있도록 분리한다.

// 유효한 GitHub 사용자 이름인지 확인하는 함수
export function isValidGithubUsername(username: string): boolean {
  return Boolean(username && !/\s/.test(username) && /^[a-zA-Z0-9-]+$/.test(username));
}
