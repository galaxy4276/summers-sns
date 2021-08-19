import signInCredentialsTest from '@test/auth/sign-in.credentials.test';
import signInTest from '@test/auth/sign-in.test';

describe('통합 테스트 수행', () => {
  describe('사용자 인증 정보 테스트', () => {
    signInCredentialsTest();
  });
  describe('사용자 회원가입 테스트', () => {
    signInTest();
  });
});
