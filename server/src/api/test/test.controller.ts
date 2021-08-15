import { Context, Next } from 'koa';
import { inspect } from 'util';

export const debugSessionController = (ctx: Context, next: Next): void => {
  const session = inspect(ctx.session);
  const cookie = inspect(ctx.cookies);
  ctx.body = {
    session,
    cookie,
  };
  next();
};

export default {};
