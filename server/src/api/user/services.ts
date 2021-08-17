import { Context } from 'koa';
import { EmailSignInProps, PhoneSignInProps } from '@typings/user';
import {
  createUserByEmail,
  createUserByPhone,
  getUserVerifiesIdByEmailSql,
  getUserVerifiesIdByPhoneSql,
} from '@api/user/sql';
import { mailClient, twilioSms } from '@services/index';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

/**
 * @desc 어떤 내용으로 가입하는 지 판별하고 유저를 생성합니다.
 */
export const createUser = async (
  ctx: Context,
  form: EmailSignInProps | PhoneSignInProps,
): Promise<void> => {
  if ('email' in form) {
    const user = await createUserByEmail(form);
    ctx.body = {
      message: `${user.username} 유저가 생성되었습니다.`,
    };
    ctx.response.status = 201;
  }
  if ('phone' in form) {
    const user = await createUserByPhone(form);
    ctx.body = {
      message: `${user.username} 유저가 생성되었습니다.`,
    };
    ctx.response.status = 201;
  }
};

/**
 * @desc code 를 phone 에 SMS 로 문자를 발송합니다.
 */
export const sendSecurityCodeSms = (
  phone: string,
  code: string,
): Promise<MessageInstance> =>
  twilioSms.client.messages.create({
    body: `summers-sns 에서 발송된 회원가입 인증 코드입니다.\n 코드: ${code}`,
    from: twilioSms.twilioPhone,
    to: `+82${phone}`,
  });

/**
 * @desc code 를 email 에 발송합니다.
 */
export const sendSecurityCodeEmail = async (
  email: string,
  code: string,
): Promise<any> => {
  const info = await mailClient.sendEmail({
    from: mailClient.getConfig().host,
    to: email,
    subject: 'Summers SNS 에서 발송된 인증코드입니다.',
    text: `summers-sns 에서 발송된 회원가입 인증 코드입니다.\n 코드: ${code}`,
  });
  return info;
};

/**
 * @desc 해당 번호에 대한 user_verifies 항목을 불러옵니다.
 */
export const getUserVerifiesIdByPhone = async (
  ctx: Context,
  phone: string,
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
