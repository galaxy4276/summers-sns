import request from 'supertest';
import getTestServer from '@test/app';
import { DatabaseConnection } from '@config/database';
import { Server } from 'http';

describe('서버 환경 테스트', () => {
  let app: Server;
  let mariadb: DatabaseConnection;

  beforeAll(async () => {
    const [testServer, dbPool] = await getTestServer();
    app = testServer;
    mariadb = dbPool;
  });

  afterAll(async () => {
    app.close();
    await mariadb.pool.end();
  });

  it('서버가 정상적으로 실행 된다.', async () => {
    await request(app)
      .head('/')
      .then(({ statusCode }) => {
        expect(statusCode).toBe(404);
      });
  });

  it('데이터베이스가 정상적으로 연결된다.', async () => {
    const conn = await mariadb.pool.getConnection();
    expect(conn.isValid()).toBeTruthy();
  });
});
