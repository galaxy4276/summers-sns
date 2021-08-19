import { Server } from 'http';
import { DatabaseConnection } from '@config/database';
import { EmailUser, PhoneUser } from '@typings/user';
import getTestServer from '@test/app';
import { TestAPI, TestSignIn } from '@test/enum';
import request from 'supertest';

export default function signInCredentialsTest(): void {
  describe('사용자 인증 정보 테스트', () => {
    let app: Server;
    let mariadb: DatabaseConnection;
    let emailForm: EmailUser;
    let phoneForm: PhoneUser;

    beforeAll(async () => {
      emailForm = { email: TestSignIn.EMAIL };
      phoneForm = { phone: TestSignIn.PHONE };

      const [testServer, dbPool] = await getTestServer();
      app = testServer;
      mariadb = dbPool;
    });

    afterAll(async () => {
      app.close();
      await mariadb.pool.end();
    });

    describe('사용자 인증 정보 생성 값 검증 테스트', () => {
      it('이메일과 번호 정보를 모두 포함 시 실패한다.', async () => {
        await request(app)
          .post(TestAPI.CREATE_CREDENTIALS)
          .send({
            phone: phoneForm.phone,
            email: emailForm.email,
          })
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('이메일 정보 생성요청 시 이메일형식이 아니면 실패한다.', async () => {
        await request(app)
          .post(TestAPI.CREATE_CREDENTIALS)
          .send({
            email: 'thisIsEmail',
          })
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });
    });

    describe('사용자 인증 정보 생성 기능 테스트', () => {
      it('이메일 정보로 사용자 인증 정보를 생성한다.', async () => {
        await request(app)
          .post(TestAPI.CREATE_CREDENTIALS)
          .send(emailForm)
          .then((data) => {
            expect(data.statusCode).toBe(201);
            expect(typeof data.body.createdRoleId).toBe('number');
          });
      });

      it('이미 생성된 이메일 정보로 사용자 인증 정보를 생성할 수 없다.', async () => {
        await request(app)
          .post(TestAPI.CREATE_CREDENTIALS)
          .send(emailForm)
          .then((data) => {
            expect(data.statusCode).toBe(400);
          });
      });

      it('폰 정보로 사용자 인증 정보를 생성한다.', async () => {
        await request(app)
          .post(TestAPI.CREATE_CREDENTIALS)
          .send({
            ...phoneForm,
            isTest: true,
          })
          .then((data) => {
            expect(data.statusCode).toBe(200);
          });
      });

      it('이미 생성된 폰 정보로 사용자 인증 정보를 생성할 수 없다.', async () => {
        await request(app)
          .post(TestAPI.CREATE_CREDENTIALS)
          .send(phoneForm)
          .then((data) => {
            expect(data.statusCode).toBe(400);
          });
      });
    });
  });
}
