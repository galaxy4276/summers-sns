import { Context } from 'koa';
import { EmailSignInProps, PhoneSignInProps } from '@typings/user';
import { createUserByEmail, createUserByPhone } from '@api/user/sql';

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

export default {};
