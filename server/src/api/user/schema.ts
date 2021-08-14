import { SignInProps } from '@typings/user';
import Joi from 'joi';

export const validateSignInForm = (form: SignInProps): void => {
  const schema = Joi.object<SignInProps>({
    email: Joi.string().email().required(),
    realname: Joi.string().min(3).max(30).required(),
    username: Joi.string().min(3).max(10).required(),
    password: Joi.string().min(8).max(50).required(),
  });

  const { error } = schema.validate(form);
  if (error) {
    throw new Error(`${error.message}(joi)`);
  }
};

export default {};
