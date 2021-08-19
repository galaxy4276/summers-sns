export enum TestSignIn {
  EMAIL = 'test12@gmail.com',
  PHONE = '01112345678',
}

export enum TestAPI {
  SIGN_IN = '/api/user',
  CREATE_CREDENTIALS = '/api/user/credentials',
  SEND_SECURITY_CODE = '/api/user/sms',
  VERIFY_SECURITY_CODE = '/api/user/sms/verify',
}
