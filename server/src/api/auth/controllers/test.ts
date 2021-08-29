import { Context, Next } from 'koa';
import { validateUserCredential } from '@api/auth/validate';
import { isTestProps } from '@services/test-utils';
import { createUserCredentials } from '@api/auth/sql';
import { setBodyByProps, setBodyMessage } from '@services/context';
import { handlingJoiError } from '@services/index';

/**
 * @desc 사용자 정보를 생성하는 컨트롤러
 */
export const createCredentialsTestController = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const credentialsForm = ctx.request.body;
    const { isPrevious, isFormError } = await validateUserCredential(
      ctx,
      credentialsForm,
    );
    if (isFormError) return await next();
    isTestProps(ctx);

    if (isPrevious) {
      setBodyMessage(ctx, '이미 존재하는 인증정보 입니다.', 409);
      return await next();
    }
    const createdCredentialsId = (await createUserCredentials(
      credentialsForm,
    )) as number;
    setBodyByProps(ctx, { createdCredentialsId }, 201);
    return await next();
  } catch (err) {
    const isJoi = handlingJoiError(ctx, err);
    if (isJoi) return next();
    throw new Error(err);
  }
};

export default {};
