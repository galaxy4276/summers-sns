import { Context } from 'koa';
import {
  getUserVerifiesIdByEmailSql,
  getUserVerifiesIdByPhoneSql,
} from '@api/auth/sql';
import { sendSecurityCodeByRules } from '@api/auth/services/sms';
import { setBodyMessage } from '@services/context';

/**
 * @desc 해당 번호에 대한 user_verifies 항목을 불러옵니다.
 */
export const getUserVerifiesIdByPhone = async (
  ctx: Context,
  phone: string | number,
): Promise<number | false> => {
  const userRole = await getUserVerifiesIdByPhoneSql(phone);
  if (!userRole) {
    ctx.response.status = 400;
    ctx.body = {
      message: '존재하지 않는 사용자 인증 정보입니다.',
    };
    return false;
  }
  return userRole.id;
};

/**
 * @desc 해당 이메일에 대한 user_verifies 항목을 불러옵니다.
 */
export const getUserVerifiesIdByEmail = async (
  ctx: Context,
  email: string,
): Promise<number | false> => {
  const userRole = await getUserVerifiesIdByEmailSql(email);
  if (!userRole) {
    ctx.response.status = 400;
    ctx.body = {
      message: '존재하지 않는 사용자 인증 정보입니다.',
    };
    return false;
  }
  return userRole.id;
};

/**
 * @desc 이미 존재하는 user_verifies 에 대해 로직을 처리합니다.
 */
export const processResendCode = async (ctx: Context): Promise<void> => {
  const form = ctx.request.body;
  const { isError } = await sendSecurityCodeByRules(ctx, form);
  if (isError) {
    setBodyMessage(ctx, '서버에서 에러가 발생하였습니다.', 500);
  }
};
