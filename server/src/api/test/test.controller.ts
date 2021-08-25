import { Context, Next } from 'koa';
import { inspect } from 'util';

export const debugSessionController = (ctx: Context, next: Next): void => {
  const session = inspect(ctx.session);
  const { user } = ctx;
  ctx.body = {
    session,
    user,
  };
  next();
};

export default {};
