import { Context } from 'koa';

/**
 * @desc 에러 관련 설정을 포함한 인증 관련 추상 클래스입니다.
 */
export default abstract class AuthErrorAbstract {
  setNoUserError(ctx: Context): void {
    ctx.body = {
      message: '사용자가 존재하지 않습니다.',
    };
    ctx.response.status = 401;
  }

  setPasswordError(ctx: Context): void {
    ctx.body = {
      message: '비밀번호가 일치하지 않습니다.',
    };
    ctx.response.status = 401;
  }

  setNoPasswordError(ctx: Context): void {
    ctx.body = {
      message: '비밀번호가 입력되지 않았습니다.',
    };
    ctx.response.status = 429;
  }

  setAuthenticationFaultError(ctx: Context): void {
    ctx.response.status = 429;
    ctx.body = { message: '요청이 잘못되었습니다.' };
  }

  setServerError(ctx: Context): void {
    ctx.response.status = 500;
    ctx.body = { message: '서버에서 에러가 발생하였습니다.' };
  }

  setNoAuthenticationError(ctx: Context): void {
    ctx.body = {
      message: '로그인 되어 있지 않은 유저입니다.',
    };
    ctx.response.status = 401;
  }
}
