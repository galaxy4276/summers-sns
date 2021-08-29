import { Context } from 'koa';

/**
 * @desc Joi 관련 에러를 ctx.body 에 넣어주고, next 반환 유무를 bool 값으로 반환한다.
 */
export default function handlingJoiError(ctx: Context, err: Error): boolean {
  if (err.message.includes('joi')) {
    ctx.body = {
      message: err.message,
    };
    ctx.response.status = 422;
    return true;
  }
  return false;
}
