import { Context } from 'koa';

/**
 * @desc 테스트 요청 정보가 포함되어 있는 지 확인합니다.
 * message & statusCode 가 포함되어 있는 경우 body 와 response code 를 설정합니다.
 * @return boolean
 */
export function isTestProps(
  ctx: Context,
  message?: string,
  statusCode?: number,
): boolean {
  const { isTest } = ctx.request.body;
  if (isTest) {
    if (message && statusCode) {
      ctx.body = {
        message,
      };
      ctx.response.status = statusCode;
    }
    return true;
  }
  return false;
}

export default {};
