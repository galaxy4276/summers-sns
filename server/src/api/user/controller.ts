import { Context, Next } from 'koa';
import { createUserCredentials, setActivateUserVerifies } from '@api/user/sql';
import { handlingJoiError, hashPlainText } from '@services/index';
import {
  createUser,
  isBothAuthProps,
  sendSecurityCodeByRules,
} from '@api/user/services';
import {
  isVerifiedUser,
  isVerifySecurityCodeForm,
  validateUser,
  validateUserCredential,
  verifySecurityCode,
} from './validate';

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
    const isVerified = await isVerifiedUser(ctx, signInForm);
    if (!isVerified) return await next();
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
export const createCredentialsController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const credentialsForm = ctx.request.body;
    const isPrevious = await validateUserCredential(ctx, credentialsForm);
    if (isPrevious) return await next();
    const createdRoleId = (await createUserCredentials(
      credentialsForm.email,
      credentialsForm.phone,
    )) as number;
    const { isError } = await sendSecurityCodeByRules(ctx, credentialsForm);
    if (isError) return await next();
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
    const { body } = ctx.request;
    const isBoth = isBothAuthProps(ctx, body);
    if (isBoth) return await next();
    await sendSecurityCodeByRules(ctx, body);
    return await next();
  } catch (err) {
    const isJoi = handlingJoiError(ctx, err);
    if (isJoi) return next();
    throw new Error(err);
  }
};

/**
 * @desc 보안코드를 받아서 사용자 인증 정보를 활성화 합니다.
 */
export const verifySecurityCodeController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const { body } = ctx.request;
    const isValid = isVerifySecurityCodeForm(ctx, body);
    if (!isValid) return await next();
    const { isCorrectKey, userVerifyId } = await verifySecurityCode(ctx, body);
    if (!isCorrectKey) return await next();
    if (typeof userVerifyId === 'number') {
      await setActivateUserVerifies(userVerifyId);
    }
    ctx.body = {
      message: '인증에 성공하였습니다.',
    };
    return await next();
  } catch (err) {
    throw new Error(err);
  }
};
