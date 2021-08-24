import { Context, Next } from 'koa';

export function isUserLogin(ctx: Context, next: Next): Promise<Next> {
  if (ctx.user) {
    ctx.body = {
      message: '로그인 한 사용자는 접근할 수 없습니다.',
    };
    ctx.response.status = 400;
    return next();
  }
  return next();
}

export function isNotUserLogin(ctx: Context, next: Next): Promise<Next> {
  if (!ctx.user) {
    ctx.body = {
      message: '로그인 한 유저만 접근할 수 있습니다.',
    };
    ctx.response.status = 400;
    return next();
  }
  return next();
}
