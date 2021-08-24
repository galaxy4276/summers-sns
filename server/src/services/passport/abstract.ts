import { Context } from 'koa';
import { v4 as uuid } from 'uuid';
import { mariadb } from '@config/index';
import { Session } from 'koa-session';
import { Connection } from 'mariadb';
import { DbSession } from '@typings/user';
import AuthErrorAbstract from '@services/passport/error-abstract';

export function isDbSession(data: number | DbSession): data is DbSession {
  return (<DbSession>data)?.session_id !== undefined;
}

/**
 * @desc Passport 구현체에 핵심 로직만을 배치해두어 가독성을 높이기 위한 추상 클래스입니다.
 * 에러 관련 함수, 데이터베이스 관련 함수들이 구현되어 있습니다.
 */
export default class AbstractLocalPassport extends AuthErrorAbstract {
  createSessionId(): string {
    return uuid();
  }

  /**
   * @desc 세션 정보를 데이터베이스에 저장합니다.
   * @return 저장된 데이터의 id (PK )
   */
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

  /**
   * @desc 세션 정보 기반으로 데이터베이스에서 세션 정보를 불러옵니다.
   * @return session 데이터 객체
   */
  async getSessionDatabase(sessionId: string): Promise<DbSession> {
    const conn = await mariadb.pool.getConnection();
    const queryResult = await conn.query(
      `SELECT * FROM \`summers-sns\`.session_store WHERE session_id = ?;`,
      [sessionId],
    );
    return queryResult[0] as DbSession;
  }

  /**
   * @desc 메모리 세션에 세션 정보가 없다면 데이터베이스에서 세션정보를 불러옵니다.
   */
  async getDbSessionIfNotExists(
    ctx: Context,
    clientId: string,
  ): Promise<number | DbSession> {
    const session = <Session>ctx.session;
    const serverSession = session[clientId] as number | undefined;
    if (serverSession) {
      return serverSession;
    }
    return this.getSessionDatabase(clientId);
  }

  /**
   * @desc 내부 메서드로 세션을 생성 및 저장하고 사용자에게 cookie 를 설정합니다.
   */
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

  /**
   * @desc 데이터베이스 존재하는 세션 정보를 삭제합니다.
   */
  async removeSessionDatabase(ctx: Context, sid: string): Promise<void> {
    const conn = await mariadb.pool.getConnection();
    await conn.query(
      `
      DELETE FROM \`summers-sns\`.session_store 
      WHERE session_id = ?
    `,
      [sid],
    );
    await conn.end();
  }
}
