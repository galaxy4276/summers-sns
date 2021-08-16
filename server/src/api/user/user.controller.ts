import { Context, Next } from 'koa';
import {
  createUserByEmail,
  createUserByPhone,
  createUserRole,
} from '@api/user/sql';
import { hashPlainText } from '@services/index';
import { validateUser, validateUserRole } from './validate';

/**
 * @desc Joi 관련 에러를 ctx.body 에 넣어주고, next 반환 유무를 bool 값으로 반환한다.
 */
export const handlingJoiError = (ctx: Context, err: Error): boolean => {
  if (err.message.includes('joi')) {
    ctx.body = {
      message: err.message,
    };
    ctx.response.status = 400;
    return true;
  }
  return false;
};

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
    const isJoi = handlingJoiError(ctx, err);
    if (isJoi) return next();
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
  try {
    const signInForm = ctx.request.body;
    const isPrevious = await validateUserRole(ctx, signInForm);
    if (isPrevious) return await next();

    const createdRoleId = await createUserRole(
      signInForm.email,
      signInForm.phone,
    );

    ctx.body = {
      createdRoleId,
    };
    return await next();
  } catch (err) {
    const isJoi = handlingJoiError(ctx, err);
    if (isJoi) return next();
    throw new Error(err);
  }
};
