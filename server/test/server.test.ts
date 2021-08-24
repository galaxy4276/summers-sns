import request from 'supertest';
import { Server } from 'http';
import { mariadb } from '@config/index';
import getTestServer from '@test/app';

describe('서버 환경 테스트', () => {
  let app: Server;

  beforeAll(async () => {
    app = await getTestServer();
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
