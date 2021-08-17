import { Context } from 'koa';
import {
  EmailSignInProps,
  EmailUser,
  PhoneSignInProps,
  PhoneUser,
} from '@typings/user';
import {
  createUserByEmail,
  createUserByPhone,
  getUserVerifiesIdByEmailSql,
  getUserVerifiesIdByPhoneSql,
  setUserVerifiesKey,
} from '@api/user/sql';
import { createDigit, mailClient, twilioSms } from '@services/index';
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
  phone: string | number,
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
 * @desc email, phone 항목이 같이 존재하는 지 유무를 bool 값으로 반환합니다.
 * @addition 두 값 모두 존재하지 않아도 true 를 반환합니다.
 */
export const isBothAuthProps = (
  ctx: Context,
  { email, phone }: { email?: string; phone?: string },
): boolean => {
  if (!(email || phone)) {
    ctx.response.status = 400;
    ctx.body = {
      message: '요청 props 가 잘못되었습니다.',
    };
    return true;
  }
  if (email && phone) {
    ctx.response.status = 400;
    ctx.body = {
      message: '요청 props 가 잘못되었습니다.',
    };
    return true;
  }
  return false;
};

/**
 * @desc phone, email 여부를 검사해서 맞는 조건에 따라 인증코드를 발송합니다.
 */
export const sendSecurityCodeByRules = async (
  ctx: Context,
  body: EmailUser | PhoneUser,
): Promise<{ isError: boolean }> => {
  const civ = createDigit(6);
  const setErrorMessage = () => {
    ctx.response.status = 500;
    ctx.body = { message: '서버에서 에러가 발생했습니다.' };
  };

  if ('email' in body) {
    const id = await getUserVerifiesIdByEmail(ctx, body.email);
    if (!id) {
      setErrorMessage();
      return { isError: true };
    }
    await setUserVerifiesKey(id, civ);
    await sendSecurityCodeEmail(body.email, civ);
    ctx.body = {
      message: `${body.email} 으로 인증코드를 발송하였습니다.`,
    };
  }

  if ('phone' in body) {
    const id = await getUserVerifiesIdByPhone(ctx, body.phone);
    if (!id) {
      setErrorMessage();
      return { isError: true };
    }
    await setUserVerifiesKey(id, civ);
    await sendSecurityCodeSms(body.phone, civ);
    ctx.body = {
      message: `${body.phone} 으로 인증코드를 발송하였습니다.`,
    };
  }
  return { isError: false };
};
