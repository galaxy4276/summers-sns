import {
  EmailSignInProps,
  EmailUserRole,
  PhoneSignInProps,
  PhoneUserRole,
} from '@typings/user';
import Joi from 'joi';
import { Context } from 'koa';
import { checkPrevUserProps, getBoolCheckPrevUserRole } from '@api/user/sql';
import {
  isSignInEmailForm,
  isSignInPhoneForm,
  ValidateUserReturnProps,
} from '@api/user/types';

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
 * @desc 사용자 인증 정보가 존재하는지 bool 값으로 반환합니다.
 */
export const validateUserRole = async (
  ctx: Context,
  form: EmailUserRole | PhoneUserRole,
): Promise<boolean> => {
  const previousError = await getBoolCheckPrevUserRole(form);
  if (previousError) {
    ctx.body = {
      message: previousError,
    };
    return true;
  }
  return false;
};

/**
 * @desc 사용자 정보가 존재하는 지 bool 값으로 반환합니다.
 */

export const validateUser = async (
  ctx: Context,
  form: EmailSignInProps | PhoneSignInProps,
): Promise<ValidateUserReturnProps> => {
  const isEmail = isSignInEmailForm(form);
  const isPhone = isSignInPhoneForm(form);
  const returnDraft = { isError: true, isEmail, isPhone };
  if (isEmail) {
    const { username, email } = validateSignInFormEmail(
      form as EmailSignInProps,
    );
    const emailError = await checkPrevUserProps(
      username,
      'email',
      email,
      'users',
    );
    if (emailError) {
      ctx.response.status = 400;
      ctx.body = {
        message: emailError,
      };
      return returnDraft;
    }
  }

  if (isPhone) {
    const { username, phone } = validateSignInFormPhone(
      form as PhoneSignInProps,
    );
    const phoneError = await checkPrevUserProps(
      username,
      'phone',
      phone,
      'users',
    );
    if (phoneError) {
      ctx.response.status = 400;
      ctx.body = {
        message: phoneError,
      };
      return returnDraft;
    }
  }

  return { ...returnDraft, isError: false };
};

/**
 * @desc 계정에 대한 인증을 수행한 사용자인 지 검사합니다.
 */
export const checkVerifiedUser = () => {};
