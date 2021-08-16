import { Context, Next } from 'koa';
import {
  createUserByEmail,
  createUserByPhone,
  createUserRole,
} from '@api/user/sql';
import { hashPlainText } from '@services/index';
import { validateUser, validateUserRole } from './validate';

/**
 * @desc 사용자를 검증하고 회원가입 로직을 수행하는 컨트롤러
 */
export const signInController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const signInForm = ctx.request.body;
    const { isError, isEmail, isPhone } = await validateUser(ctx, signInForm);
    if (isError) return await next();

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
    }
    if (isPhone) {
      const createdUser = await createUserByPhone(form);
      ctx.body = {
        message: `${createdUser.username} 유저가 생성되었습니다.`,
      };
    }
    ctx.response.status = 201;
    return await next();
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

/**
 * @desc 사용자 정보를 생성하는 컨트롤러
 */
export const createUserRoleController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  const signInForm = ctx.request.body;
  const isPrevious = await validateUserRole(ctx, signInForm);
  if (isPrevious) return next();

  const createdRoleId = await createUserRole(
    signInForm.email,
    signInForm.phone,
  );

  ctx.body = {
    createdRoleId,
  };
  return next();
};
