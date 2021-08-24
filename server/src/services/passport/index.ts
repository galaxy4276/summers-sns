import { Context, Next } from 'koa';
import { mariadb } from '@config/index';
import { compareHash } from '@services/bcrypt';
import { getSafeUserById, getUserByRule } from '@services/common-sql';
import { debug } from 'loglevel';
import { Session } from 'koa-session';
import { DbSession } from '@typings/user';
import AbstractLocalPassport, { isDbSession } from './abstract';

/**
 * @desc 로그인을 위한 미들웨어들을 반환하는 인증 클래스 입니다.
 */
class LocalPassPort extends AbstractLocalPassport {
  /**
   * @desc 사용자 입력정보로 로그인을 수행합니다.
   * @return 로그인 미들웨어 함수를 반환합니다.
   */
  authenticate() {
    return async (ctx: Context, next: Next) => {
      try {
        const conn = await mariadb.pool.getConnection();
        const { password } = ctx.request.body;
        if (!password) {
          this.setNoPasswordError(ctx);
          return await next();
        }
        const user = await getUserByRule(ctx);
        if (user) {
          const isCorrectPassword = await compareHash(password, user.password);
          if (isCorrectPassword) {
            await this.createSessionWithDatabase(ctx, conn, user.id);
          }
          if (!isCorrectPassword) {
            this.setPasswordError(ctx);
            await conn.end();
            return await next();
          }
          ctx.response.status = 200;
          await conn.end();
          await next();
        }

        this.setAuthenticationFaultError(ctx);
        await conn.end();
        await next();
      } catch (err) {
        throw new Error(err);
      }
    };
  }

  /**
   * @desc cookie 를 이용해 세션 정보에서 유저 정보를 복구합니다.
   * @return 세션 복구 미들웨어 함수를 반환합니다.
   */
  session() {
    return async (ctx: Context, next: Next) => {
      if (ctx.path === '/api/user/login') {
        return next();
      }
      try {
        const session = <Session>ctx.session;
        const clientSessionId = ctx.cookies.get('sid');
        if (!clientSessionId) return await next();
        const dbData = (await this.getDbSessionIfNotExists(
          ctx,
          clientSessionId,
        )) as DbSession;
        if (isDbSession(dbData)) {
          const { session_id: sessionId, user_id: userId } = dbData;
          session[sessionId] = userId;
          ctx.user = await getSafeUserById(userId);
        } else {
          ctx.user = await getSafeUserById(dbData);
        }
        await next();
      } catch (err) {
        debug(err);
        this.setServerError(ctx);
        await next();
      }
    };
  }

  logout() {
    return async (ctx: Context, next: Next) => {
      try {
        const sid = ctx.cookies.get('sid');
        if (!sid) {
          this.setNoAuthenticationError(ctx);
          return await next();
        }
        const session = <Session>ctx.session;
        if (sid in session) {
          delete session[sid];
          await this.removeSessionDatabase(ctx, sid);
        }
      } catch (err) {
        debug(err);
        await next();
      }
    };
  }
}

export default new LocalPassPort();
