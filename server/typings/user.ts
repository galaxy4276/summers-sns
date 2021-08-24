interface SignInDefaultProps {
  realname: string;
  username: string;
  password: string;
}

export interface EmailSignInProps extends SignInDefaultProps {
  email: string;
}

export interface PhoneSignInProps extends SignInDefaultProps {
  phone: string;
}

export interface AllUserProps extends SignInDefaultProps {
  id: number;
  email?: string;
  phone?: string;
  follower_count: number;
  following_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export type SafeUserProps = Omit<AllUserProps, 'password' | 'deleted_at'>;

interface Email {
  email: string;
}

interface Phone {
  phone: string | number;
}

interface TestProp {
  isTest?: boolean | string;
}

export type EmailUser = Email & TestProp;
export type PhoneUser = Phone & TestProp;

export interface UserVerify {
  id: number;
  email: string | null;
  phone: string | null;
  is_verified: 0 | 1;
  key_expired_at: Date | null;
  civ_key: string | null;
}

export interface EmailVerifyCode extends Email {
  code: string | number;
}

export interface PhoneVerifyCode extends Phone {
  code: string | number;
}

export type UserVerifyCivKeyReturnType = Pick<UserVerify, 'civ_key'> &
  Pick<UserVerify, 'id'>;

export interface DbSession {
  id: number;
  session_id: string;
  user_id: number;
}
