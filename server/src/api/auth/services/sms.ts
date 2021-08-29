import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { createDigit, mailClient, twilioSms } from '@services/index';
import { Context } from 'koa';
import { EmailUser, PhoneUser } from '@typings/user';
import { setUserVerifiesKey } from '@api/auth/sql';
import {
  getUserVerifiesIdByEmail,
  getUserVerifiesIdByPhone,
} from '@api/auth/services/credentials';

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
