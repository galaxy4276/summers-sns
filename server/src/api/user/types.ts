import { EmailSignInProps, PhoneSignInProps } from '@typings/user';

export const isSignInEmailForm = (
  form: EmailSignInProps | PhoneSignInProps,
): form is EmailSignInProps => {
  return (<EmailSignInProps>form).email !== undefined;
};

export const isSignInPhoneForm = (
  form: EmailSignInProps | PhoneSignInProps,
): form is PhoneSignInProps => {
  return (<PhoneSignInProps>form).phone !== undefined;
};

/**
 * @desc validateUser 함수에 대한 반환 타입
 */
export interface ValidateUserReturnProps {
  isError: boolean;
  isEmail: boolean;
  isPhone: boolean;
}
