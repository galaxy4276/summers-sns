export enum TestSignIn {
  EMAIL = 'test12@gmail.com',
  PHONE = '01112345678',
  TEST_REAL_PHONE = '1112345678',
  PASSWORD = 'test12',
}

export enum TestAPI {
  SIGN_IN = '/api/auth',
  CREATE_CREDENTIALS = '/api/auth/credentials/test',
  SEND_SECURITY_CODE = '/api/auth/sms',
  VERIFY_SECURITY_CODE = '/api/auth/sms/verify',
  LOGIN = '/api/auth/login',
  LOGOUT = '/api/auth/logout',
}
