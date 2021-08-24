import { Context } from 'koa';

export function isTestProps(
  ctx: Context,
  message: string,
  statusCode: number,
): boolean {
  const { isTest } = ctx.request.body;
  if (isTest) {
    ctx.body = {
      message,
    };
    ctx.response.status = statusCode;
    return true;
  }
  return false;
}

export default {};
