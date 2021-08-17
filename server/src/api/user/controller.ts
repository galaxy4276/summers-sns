import { Context, Next } from 'koa';
import { createUserRole, setUserVerifiesKey } from '@api/user/sql';
import { createDigit, handlingJoiError, hashPlainText } from '@services/index';
import {
  createUser,
  getUserVerifiesIdByEmail,
  getUserVerifiesIdByPhone,
  sendSecurityCodeEmail,
  sendSecurityCodeSms,
} from '@api/user/services';
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

/**
 * @desc 사용자 인증 정보를 활성화 하기 위한 보안 코드를 전송합니다.
 */
export const sendSecurityCodeController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const { email, phone } = ctx.request.body;
    const civ = createDigit(6);
    if (phone) {
      const id = await getUserVerifiesIdByPhone(ctx, phone);
      if (!id) return await next();
      await setUserVerifiesKey(id, civ);
      await sendSecurityCodeSms(phone, civ);
      ctx.body = {
        message: `${phone} 으로 인증코드를 발송하였습니다.`,
      };
    }

    if (email) {
      const id = await getUserVerifiesIdByEmail(ctx, email);
      if (!id) return await next();
      await setUserVerifiesKey(id, civ);
      await sendSecurityCodeEmail(email, civ);
      ctx.body = {
        message: `${email} 으로 인증코드를 발송하였습니다.`,
      };
    }

    return await next();
  } catch (err) {
    const isJoi = handlingJoiError(ctx, err);
    if (isJoi) return next();
    throw new Error(err);
  }
};
