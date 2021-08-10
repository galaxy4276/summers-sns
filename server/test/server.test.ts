import request from 'supertest';
import { connectDatabase, getTestServer } from '@test/app';
import { DatabaseConnection } from '@config/database';
import { Server } from 'http';

describe('서버 환경 테스트', () => {
  let app: Server;
  let pool: DatabaseConnection;

  beforeAll(async () => {
    app = getTestServer();
    pool = await connectDatabase();
  });

  it('서버가 정상적으로 실행 된다.', async () => {
    await request(app)
      .head('/')
      .then(({ statusCode }) => {
        expect(statusCode).toBe(404);
      });
  });

  it('데이터베이스가 정상적으로 연결된다.', () => {
    expect(pool.getConnection().isValid()).toBeTruthy();
  });
});
