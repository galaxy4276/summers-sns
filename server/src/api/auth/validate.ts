import {
  EmailSignInProps,
  EmailUser,
  EmailVerifyCode,
  PhoneSignInProps,
  PhoneUser,
  PhoneVerifyCode,
} from '@typings/user';
import Joi from 'joi';
import { Context } from 'koa';
import {
  checkPrevUserByEmail,
  checkPrevUserByPhone,
  checkPrevUserByUsername,
  getBoolCheckPrevUserRole,
  getUserVerifiesCivKeyByEmail,
  getUserVerifiesCivKeyByPhone,
  isVerifiedAccount,
} from '@api/auth/sql';
import {
  getUserVerifiesIdByEmail,
  getUserVerifiesIdByPhone,
} from '@api/auth/services';

/**
 * @desc 이메일 회원가입 폼 검증 함수
 */
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

/**
 * @desc 폰 번호 회원가입 폼 검증 함수
 */
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

/**
 * @desc 이메일로 가입하는 사용자 인증 정보 생성 폼 검증 함수
 */
const validateUserRoleFormEmail = (form: EmailUser) => {
  const { error } = Joi.object<EmailUser>({
    email: Joi.string().email().required(),
    isTest: Joi.bool(),
  }).validate(form);
  if (error) throw new Error(`${error.message}(joi)`);
};

/**
 * @desc 번호로 가입하는 사용자 인증 정보 생성 폼 검증 함수
 */
const validateUserRoleFormPhone = (form: PhoneUser) => {
  const { error } = Joi.object<PhoneUser>({
    phone: Joi.string().max(40).required(),
    isTest: Joi.bool(),
  }).validate(form);
  if (error) throw new Error(`${error.message}(joi)`);
};

/**
 * @desc 입력 폼을 검사하고, 사용자 인증 정보가 존재하는지 검사합니다.
 * @return @type ValidateCredentialReturns
 */

type ValidateCredentialReturns = {
  isFormError: boolean;
  isPrevious: boolean;
};
export const validateUserCredential = async (
  ctx: Context,
  form: EmailUser | PhoneUser,
): Promise<ValidateCredentialReturns> => {
  if (!((<EmailUser>form).email || (<PhoneUser>form).phone)) {
    ctx.response.status = 422;
    ctx.body = {
      message: '인증정보가 존재하지 않습니다.',
    };
    return { isFormError: true, isPrevious: false };
  }

  if (form.isTest) {
    if (typeof form.isTest !== 'boolean') form.isTest = form.isTest === 'true';
  }
  if ('email' in form) validateUserRoleFormEmail(form);
  if ('phone' in form) validateUserRoleFormPhone(form);
  const previousError = await getBoolCheckPrevUserRole(form);
  if (previousError) {
    ctx.response.status = 409;
    ctx.body = {
      message: previousError,
    };
    return { isFormError: false, isPrevious: true };
  }
  return { isFormError: false, isPrevious: false };
};

/**
 * @returns 회원가입 전 유저가 이미 존재하는지 검증하는 함수를 반환
 */
export const checkPrevUserByRule = (
  form: EmailSignInProps | PhoneSignInProps,
): Promise<string | void> | undefined => {
  if ('email' in form) {
    return checkPrevUserByEmail(form.email);
  }
  if ('phone' in form) {
    return checkPrevUserByPhone(form.phone);
  }
};

/**
 * @desc 사용자 정보가 존재하는 지 bool 값으로 반환합니다.
 */
export const isValidUser = async (
  ctx: Context,
  form: EmailSignInProps | PhoneSignInProps,
): Promise<boolean> => {
  if (!((<EmailSignInProps>form).email || (<PhoneSignInProps>form).phone)) {
    ctx.response.status = 400;
    return true;
  }
  if ('email' in form) validateSignInFormEmail(form);
  if ('phone' in form) validateSignInFormPhone(form);

  const isPrevUsername = await checkPrevUserByUsername(form.username);
  if (isPrevUsername) {
    ctx.response.status = 400;
    ctx.body = {
      message: '이미 존재하는 유저이름입니다.',
    };
    return true;
  }
  const error = await checkPrevUserByRule(form);
  if (error) {
    ctx.response.status = 400;
    ctx.body = {
      message: error,
    };
    return true;
  }

  return false;
};

/**
 * @desc 계정에 대한 인증을 수행한 사용자인 지 검사합니다.
 */
export const isVerifiedUser = async (
  ctx: Context,
  form: EmailSignInProps | PhoneSignInProps,
): Promise<boolean> => {
  const setError = () => {
    ctx.response.status = 400;
    ctx.body = { message: '이메일 또는 SMS 에서 인증되지 않은 유저입니다.' };
  };
  const isCheck = async (id: number) => {
    const isVerified = await isVerifiedAccount(id);
    if (!isVerified) setError();
    return isVerified;
  };

  if ('email' in form) {
    const id = await getUserVerifiesIdByEmail(ctx, form.email);
    if (!id) {
      setError();
      return false;
    }
    return isCheck(id);
  }

  if ('phone' in form) {
    const id = await getUserVerifiesIdByPhone(ctx, form.phone);
    if (!id) {
      setError();
      return false;
    }
    return isCheck(id);
  }
  return false;
};

/**
 * @desc 인증 코드 활성화를 위한 요청을 검증합니다.
 */
export const isVerifySecurityCodeForm = (
  ctx: Context,
  form: EmailVerifyCode | PhoneVerifyCode,
): boolean => {
  const setError = () => {
    ctx.response.status = 400;
    ctx.body = {
      message: '잘못된 요청입니다.',
    };
  };
  if ('email' in form) {
    return form.code !== undefined;
  }
  if ('phone' in form) {
    return form.code !== undefined;
  }
  setError();
  return false;
};

/**
 * @desc 존재하는 사용자 인증 정보에서 body 에서 받은 인증코드 값을 비교하여 bool 로 반환합니다.
 */

type VerifySecurityCodeReturnType = {
  isCorrectKey: boolean;
  userVerifyId?: number;
};
export const verifySecurityCode = async (
  ctx: Context,
  form: EmailVerifyCode | PhoneVerifyCode,
): Promise<VerifySecurityCodeReturnType> => {
  const setKeyError = () => {
    ctx.response.status = 400;
    ctx.body = {
      message: '인증 정보 또는 인증코드가 존재하지 않습니다.',
    };
  };
  const setCorrectError = () => {
    ctx.response.status = 400;
    ctx.body = {
      message: '입력된 인증코드가 잘못되었습니다.',
    };
  };
  if ('email' in form) {
    const { civ_key: key, id } = await getUserVerifiesCivKeyByEmail(form.email);
    if (!key) {
      setKeyError();
      return { isCorrectKey: false };
    }
    const isCorrectKey = String(form.code) === key;
    if (!isCorrectKey) setCorrectError();
    return {
      isCorrectKey,
      userVerifyId: id,
    };
  }

  if ('phone' in form) {
    const { civ_key: key, id } = await getUserVerifiesCivKeyByPhone(form.phone);
    if (!key) {
      setKeyError();
      return { isCorrectKey: false };
    }
    const isCorrectKey = String(form.code) === key;
    if (!isCorrectKey) setCorrectError();
    return {
      isCorrectKey,
      userVerifyId: id,
    };
  }
  return { isCorrectKey: false };
};
