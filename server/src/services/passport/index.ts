import { Context, Next } from 'koa';
import { mariadb } from '@config/index';
import { compareHash } from '@services/bcrypt';
import { getSafeUserById, getUserByRule } from '@services/common-sql';
import { debug } from 'loglevel';
import AbstractLocalPassport from './abstract';

/**
 * @desc 로그인을 위한 미들웨어들을 반환하는 인증 클래스 입니다.
 */
class LocalPassPort extends AbstractLocalPassport {
  authenticate() {
    return async (ctx: Context, next: Next) => {
      try {
        const conn = await mariadb.pool.getConnection();
        const { password } = ctx.request.body;
        const user = await getUserByRule(ctx);
        if (user) {
          const isCorrectPassword = await compareHash(password, user.password);
          if (isCorrectPassword) {
            await this.createSessionWithDatabase(ctx, conn, user.id);
          } else {
            this.setPasswordError(ctx);
            await conn.end();
            return await next();
          }
          ctx.response.status = 200;
          await conn.end();
          await next();
        }
        ctx.response.status = 400;
        ctx.body = { message: '요청이 잘못되었습니다.' };
        await next();
      } catch (err) {
        throw new Error(err);
      }
    };
  }

  session() {
    return async (ctx: Context, next: Next) => {
      if (ctx.path === '/api/user/login') {
        return next();
      }
      try {
        const clientSessionId = ctx.cookies.get('sid');
        if (!clientSessionId) return await next();
        const userId = await this.getDbSessionIfNotExists(ctx, clientSessionId);
        if (userId) ctx.user = await getSafeUserById(userId);
        await next();
      } catch (err) {
        debug(err);
        ctx.response.status = 500;
        ctx.body = { message: '서버에서 에러가 발생하였습니다.' };
      }
    };
  }
}

export default new LocalPassPort();
