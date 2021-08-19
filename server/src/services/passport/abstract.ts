import { Context } from 'koa';
import { v4 as uuid } from 'uuid';
import { Connection } from 'mariadb';
import { mariadb } from '@config/index';
import { Session } from 'koa-session';

/**
 * @desc Passport 구현체에 핵심 로직만을 배치해두어 가독성을 높이기 위한 추상 클래스입니다.
 * 에러 관련 함수, 데이터베이스 관련 함수들이 구현되어 있습니다.
 */
export default class AbstractLocalPassport {
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

  async createSessionWithDatabase(
    ctx: Context,
    conn: Connection,
    userId: number,
  ): Promise<void> {
    const sessionId = this.createSessionId();
    const session = <Session>ctx.session;
    await this.saveSessionDatabase(conn, sessionId, userId);
    ctx.cookies.set('sid', sessionId);
    session[sessionId] = userId;
  }
}
