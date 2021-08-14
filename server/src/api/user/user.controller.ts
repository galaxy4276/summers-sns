import { Context, Next } from 'koa';
import { validateSignInForm } from '@api/user/schema';
import { SignInProps } from '@typings/user';
import { checkPrevUser, createUser } from '@api/user/sql';
import { hashPlainText } from '@services/index';

export const signInController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const signInForm: SignInProps = ctx.request.body;
    validateSignInForm(signInForm);
    const { username, email, password: plainPassword } = signInForm;
    const errMessage = await checkPrevUser(username, email);
    if (errMessage) {
      ctx.response.status = 400;
      ctx.body = {
        message: errMessage,
      };
      return await next();
    }
    const password = await hashPlainText(plainPassword, 10);
    const form = {
      ...signInForm,
      password,
    };
    const createdUser = await createUser(form);
    ctx.response.status = 201;
    ctx.body = {
      message: `${createdUser?.username} 유저가 생성되었습니다.`,
    };
  } catch (err) {
    if (err.message.includes('joi')) {
      ctx.response.status = 400;
      ctx.body = {
        message: err.message,
      };
      return next();
    }
    throw new Error(err);
  }
};

export default {};
