import { Context } from 'koa';
import { EmailSignInProps, PhoneSignInProps } from '@typings/user';
import {
  createUserByEmail,
  createUserByPhone,
  createUserRole,
} from '@api/auth/sql';

/**
 * @desc 어떤 내용으로 가입하는 지 판별하고 유저를 생성합니다.
 */
const createUser = async (
  ctx: Context,
  form: EmailSignInProps | PhoneSignInProps,
): Promise<void> => {
  if ('email' in form) {
    const user = await createUserByEmail(form);
    await createUserRole(user.id);
    ctx.response.status = 201;
    ctx.body = {
      message: `${user.username} 유저가 생성되었습니다.`,
    };
  }
  if ('phone' in form) {
    const user = await createUserByPhone(form);
    await createUserRole(user.id);
    ctx.response.status = 201;
    ctx.body = {
      message: `${user.username} 유저가 생성되었습니다.`,
    };
  }
};

export default createUser;
