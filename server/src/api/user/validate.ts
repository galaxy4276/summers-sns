import {
  EmailSignInProps,
  EmailUserRole,
  PhoneSignInProps,
  PhoneUserRole,
} from '@typings/user';
import Joi from 'joi';
import { Context } from 'koa';
import { checkPrevUserProps, getBoolCheckPrevUserRole } from '@api/user/sql';
import { isSignInEmailForm, isSignInPhoneForm } from '@api/user/types';

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
const validateUserRoleFormEmail = (form: EmailUserRole) => {
  const { error } = Joi.object<EmailUserRole>({
    email: Joi.string().email().required(),
  }).validate(form);
  if (error) throw new Error(`${error.message}(joi)`);
};

/**
 * @desc 번호로 가입하는 사용자 인증 정보 생성 폼 검증 함수
 */
const validateUserRoleFormPhone = (form: PhoneUserRole) => {
  const { error } = Joi.object<PhoneUserRole>({
    phone: Joi.string().max(40).required(),
  }).validate(form);
  if (error) throw new Error(`${error.message}(joi)`);
};

/**
 * @desc 사용자 인증 정보가 존재하는지 bool 값으로 반환합니다.
 */
export const validateUserRole = async (
  ctx: Context,
  form: EmailUserRole | PhoneUserRole,
): Promise<boolean> => {
  if ('email' in form) validateUserRoleFormEmail(form);
  if ('phone' in form) validateUserRoleFormPhone(form);

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
): Promise<boolean> => {
  const isEmail = isSignInEmailForm(form);
  const isPhone = isSignInPhoneForm(form);
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
      return true;
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
      return true;
    }
  }

  return false;
};

/**
 * @desc 계정에 대한 인증을 수행한 사용자인 지 검사합니다.
 */
export const checkVerifiedUser = () => {};
