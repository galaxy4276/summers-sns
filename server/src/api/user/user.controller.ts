import { Context, Next } from 'koa';
import {
  isSignInEmailForm,
  isSignInPhoneForm,
  validateSignInFormEmail,
  validateSignInFormPhone,
} from '@api/user/validate';
import {
  checkPrevUserByEmail,
  checkPrevUserByPhone,
  createUserByEmail,
  createUserByPhone,
} from '@api/user/sql';
import { hashPlainText } from '@services/index';

/**
 * @desc 사용자를 검증하고 회원가입 로직을 수행하는 컨트롤러
 */
export const signInController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const signInForm = ctx.request.body;
    const isEmail = isSignInEmailForm(signInForm);
    const isPhone = isSignInPhoneForm(signInForm);
    if (isEmail) {
      const { username, email } = validateSignInFormEmail(signInForm);
      const emailError = await checkPrevUserByEmail(username, email);
      if (emailError) {
        ctx.body = {
          message: emailError,
        };
        return await next();
      }
    }
    if (isPhone) {
      const { username, phone } = validateSignInFormPhone(signInForm);
      const phoneError = await checkPrevUserByPhone(username, phone);
      console.log({ phoneError });
      if (phoneError) {
        ctx.body = {
          message: phoneError,
        };
        return await next();
      }
    }

    const password = await hashPlainText(signInForm.password, 10);
    const form = {
      ...signInForm,
      password,
    };
    if (isEmail) {
      const createdUser = await createUserByEmail(form);
      ctx.body = {
        message: `${createdUser.username} 유저가 생성되었습니다.`,
      };
    } else if (isPhone) {
      const createdUser = await createUserByPhone(form);
      ctx.body = {
        message: `${createdUser.username} 유저가 생성되었습니다.`,
      };
    }
    ctx.response.status = 201;
    await next();
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
