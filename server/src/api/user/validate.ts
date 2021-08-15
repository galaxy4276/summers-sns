import { EmailSignInProps, PhoneSignInProps } from '@typings/user';
import Joi from 'joi';

export const validateSignInFormEmail = (
  form: EmailSignInProps,
): EmailSignInProps => {
  const schema = Joi.object<EmailSignInProps>({
    email: Joi.string().email().required(),
    realname: Joi.string().min(3).max(30).required(),
    username: Joi.string().min(3).max(10).required(),
    password: Joi.string().min(8).max(50).required(),
  });

  const { value, error } = schema.validate(form);
  if (error) {
    throw new Error(`${error.message}(joi)`);
  }
  return value as EmailSignInProps;
};

export const validateSignInFormPhone = (
  form: PhoneSignInProps,
): PhoneSignInProps => {
  const schema = Joi.object<PhoneSignInProps>({
    phone: Joi.string().max(20).required(),
    realname: Joi.string().min(3).max(30).required(),
    username: Joi.string().min(3).max(10).required(),
    password: Joi.string().min(8).max(50).required(),
  });

  const { value, error } = schema.validate(form);
  if (error) {
    throw new Error(`${error.message}(joi)`);
  }
  return value;
};

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

export default {};
