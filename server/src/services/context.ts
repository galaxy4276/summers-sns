import { Context } from 'koa';

export function setBodyMessage(
  ctx: Context,
  message: string | number,
  statusCode?: number,
): void {
  ctx.body = { message };
  if (statusCode) {
    ctx.response.status = statusCode;
  } else {
    ctx.response.status = 200;
  }
}

export function setBodyByProps(
  ctx: Context,
  props: Record<string, string | number>,
  statusCode?: number,
): void {
  ctx.body = {
    ...props,
  };
  if (statusCode) {
    ctx.response.status = statusCode;
  } else {
    ctx.response.status = 200;
  }
}

export default {};
