import request from 'supertest';
import getTestServer from '@test/app';
import { DatabaseConnection } from '@config/database';
import { Server } from 'http';
import { SignInProps } from '@typings/user';

describe('인증 테스트', () => {
  let app: Server;
  let mariadb: DatabaseConnection;
  let form: SignInProps;

  beforeAll(async () => {
    form = {
      email: 'test12@gmail.com',
      realname: 'realtest',
      username: 'test12',
      password: 'test1234',
    };
    const [testServer, dbPool] = await getTestServer();
    app = testServer;
    mariadb = dbPool;
  });

  afterAll(async () => {
    app.close();
    await mariadb.pool.end();
  });

  describe('회원가입 테스트', () => {
    describe('입력 값 검증', () => {
      it('username 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<SignInProps, 'username'> = {
          email: form.email,
          password: form.password,
          realname: form.realname,
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('username 길이가 3글자 미만이면 실패한다.', async () => {
        const testForm: SignInProps = {
          ...form,
          username: 'th',
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('username 길이가 10글자를 넘으면 실패한다.', async () => {
        const testForm: SignInProps = {
          ...form,
          username: 'iamgreatherthan10characters',
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('realname 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<SignInProps, 'realname'> = {
          email: form.email,
          password: form.password,
          username: form.username,
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('realname 길이가 3글자 미만이면 실패한다.', async () => {
        const testForm: SignInProps = {
          ...form,
          realname: 'th',
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('realname 길이가 30글자를 초과면 실패한다.', async () => {
        const testForm: SignInProps = {
          ...form,
          realname:
            'iamgreatherthan30charactersiamgreatherthan30charactersiamgreatherthan30charactersiamgreatherthan30characters',
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('password 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<SignInProps, 'password'> = {
          email: form.email,
          username: form.username,
          realname: form.realname,
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('password 길이가 8글자 미만이면 실패한다.', async () => {
        const testForm: SignInProps = {
          ...form,
          password: 'eightee',
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('password 길이가 50글자 초과면 실패한다.', async () => {
        const testForm: SignInProps = {
          ...form,
          realname: 'fifteenfifteenfifteenfifteenfifteenfifteenfifteenfifteen',
        };
        await request(app)
          .post('/api/user')
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });
    });

    describe('회원가입 기능 테스트', () => {
      it('테스트 계정이 회원가입 된다.', async () => {
        await request(app)
          .post('/api/user')
          .send(form)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(201);
          });
      });

      it('이미 가입된 대상은 가입되지 않는다.', async () => {
        await request(app)
          .post('/api/user')
          .send(form)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
        const conn = await mariadb.pool.getConnection();
        await conn.query('DELETE FROM `summers-sns`.users WHERE email = ?', [
          form.email,
        ]);
      });
    });
  });
});
