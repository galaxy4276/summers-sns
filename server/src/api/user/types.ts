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
