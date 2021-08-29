import { Context, Next } from 'koa';
import { createUserCredentials, setActivateUserVerifies } from '@api/auth/sql';
import {
  handlingJoiError,
  hashPlainText,
  setBodyByProps,
} from '@services/index';
import { createUser, sendSecurityCodeByRules } from '@api/auth/services';
import { processResendCode } from '@api/auth/services/credentials';
import {
  isVerifiedUser,
  isVerifySecurityCodeForm,
  isValidUser,
  validateUserCredential,
  verifySecurityCode,
  isBothAuthProps,
} from '../validate';

/**
 * @desc 사용자를 검증하고 회원가입 로직을 수행하는 컨트롤러
 */
export const signInController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const signInForm = ctx.request.body;
    const isError = await isValidUser(ctx, signInForm);
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
    const { isPrevious, isFormError } = await validateUserCredential(
      ctx,
      credentialsForm,
    );
    if (isFormError) return await next();
    if (isPrevious) {
      await processResendCode(ctx);
      return await next();
    }
    const createdCredentialsId = (await createUserCredentials(
      credentialsForm,
    )) as number;
    const { isError } = await sendSecurityCodeByRules(ctx, credentialsForm);
    if (isError) return await next();
    setBodyByProps(ctx, { createdCredentialsId }, 201);
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

/**
 * @desc 사용자 로그인을 수행합니다.
 */
export const loginController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  if (ctx.response.status < 400) {
    ctx.body = {
      message: '로그인 성공',
    };
  }

  await next();
};
