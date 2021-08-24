export enum TestSignIn {
  EMAIL = 'test12@gmail.com',
  PHONE = '01112345678',
  TEST_REAL_PHONE = '1112345678',
  PASSWORD = 'test12',
}

export enum TestAPI {
  SIGN_IN = '/api/user',
  CREATE_CREDENTIALS = '/api/user/credentials',
  SEND_SECURITY_CODE = '/api/user/sms',
  VERIFY_SECURITY_CODE = '/api/user/sms/verify',
  LOGIN = '/api/user/login',
  LOGOUT = '/api/user/logout',
}
