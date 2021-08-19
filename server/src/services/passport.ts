import { Context, Next } from 'koa';
import { mariadb } from '@config/index';
import { getUserByEmail, getUserByPhone } from '@test/auth/clear-database';
import { Session } from 'koa-session';
import { v4 as uuid } from 'uuid';
import { compareHash } from '@services/bcrypt';
import { Connection } from 'mariadb';
import { getUserById } from '@services/common-sql';

class LocalPassPort {
  setNoUserError(ctx: Context): void {
    ctx.body = {
      message: '사용자가 존재하지 않습니다.',
    };
    ctx.response.status = 401;
  }

  setPasswordError(ctx: Context): void {
    ctx.body = {
      message: '비밀번호가 일치하지 않습니다.',
    };
    ctx.response.status = 400;
  }

  createSessionId(): string {
    return uuid();
  }

  async saveSessionDatabase(
    conn: Connection,
    sessionId: string,
    userId: number,
  ): Promise<number> {
    const { insertId }: { insertId: number } = await conn.query(
      `
      INSERT INTO \`summers-sns\`.session_store (session_id, user_id) VALUES (?, ?);
    `,
      [sessionId, userId],
    );
    return insertId;
  }

  async getSessionDatabase(sessionId: string): Promise<any> {
    const conn = await mariadb.pool.getConnection();
    const queryResult = await conn.query(
      `SELECT user_id FROM \`summers-sns\`.session_store WHERE session_id = ?;`,
      [sessionId],
    );
    return queryResult[0];
  }

  // TODO: Need Refactor
  authenticate() {
    return async (ctx: Context, next: Next) => {
      try {
        const conn = await mariadb.pool.getConnection();
        const { email, phone, password } = ctx.request.body;
        const session = <Session>ctx.session;
        if (email) {
          const user = await getUserByEmail(conn, email);
          if (!user?.id) {
            this.setNoUserError(ctx);
            await conn.end();
            return await next();
          }
          const isCorrectPassword = await compareHash(password, user.password);
          if (isCorrectPassword) {
            const sessionId = this.createSessionId();
            await this.saveSessionDatabase(conn, sessionId, user.id);
            session[sessionId] = user.id;
          } else {
            this.setPasswordError(ctx);
          }
          await next();
        }
        if (phone) {
          const user = await getUserByPhone(conn, phone);
          if (!user?.id) {
            this.setNoUserError(ctx);
            await conn.end();
            return await next();
          }
          const isCorrectPassword = await compareHash(password, user.password);
          if (isCorrectPassword) {
            const sessionId = this.createSessionId();
            console.log('세션 데이터베이스 작업');
            await this.saveSessionDatabase(conn, sessionId, user.id);
            ctx.cookies.set('sid', sessionId);
            session[sessionId] = user.id;
          }
          if (!isCorrectPassword) {
            this.setPasswordError(ctx);
          }
        }

        ctx.response.status = 200;
        await conn.end();
        await next();
      } catch (err) {
        throw new Error(err);
      }
    };
  }

  async getDbSessionIfNotExists(ctx: Context, clientId: string): Promise<any> {
    const session = <Session>ctx.session;
    const serverSession = session[clientId] as string | undefined;
    if (serverSession) {
      return serverSession;
    }
    const { user_id: id } = (await this.getSessionDatabase(clientId)) as {
      user_id: number;
    };
    return id;
  }

  session() {
    return async (ctx: Context, next: Next) => {
      if (ctx.path === '/api/user/login') {
        return next();
      }
      const clientSessionId = ctx.cookies.get('sid');
      if (!clientSessionId) return next();
      // FIXME: 데이터베이스에서 꺼내올 경우도 추가해야한다.
      const userId = await this.getDbSessionIfNotExists(ctx, clientSessionId);
      if (userId) ctx.user = await getUserById(userId);
      await next();
    };
  }
}

export default new LocalPassPort();
