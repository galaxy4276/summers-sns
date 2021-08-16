import { Context, Next } from 'koa';
import { createUserRole } from '@api/user/sql';
import { handlingJoiError, hashPlainText } from '@services/index';
import { createUser } from '@api/user/services';
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
    const isError = await validateUser(ctx, signInForm);
    if (isError) return await next();

    const password = await hashPlainText(signInForm.password, 10);
    const form = {
      ...signInForm,
      password,
    };
    await createUser(ctx, form);
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
