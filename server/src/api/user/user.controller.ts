import { Context } from 'koa';
import { debug as log } from 'loglevel';
import { validateSignInForm } from '@api/user/schema';
import { SignInProps } from '@typings/user';
import { createUserSql } from '@api/user/sql';
import hashPlain from '../../services/hashPlain';

// TODO: username 중복 예외 처리
export const signInController = async (ctx: Context): Promise<void> => {
  try {
    log('회원가입 컨트롤러');
    const signInForm: SignInProps = ctx.request.body;
    validateSignInForm(signInForm);
    const password = await hashPlain(signInForm.password, 10);
    const form = {
      ...signInForm,
      password,
    };
    const username = await createUserSql(form);
    ctx.body = {
      message: `${username} 유저가 생성되었습니다.`,
    };
  } catch (err) {
    log(err);
    throw new Error(err);
  }
};

export default {};
