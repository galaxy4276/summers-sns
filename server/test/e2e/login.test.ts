import getTestServer from '@test/helper/app';
import { PhoneLogin } from '@typings/user';
import { TestAPI, TestSignIn } from '@test/helper/enum';
import { Server } from 'http';
import request, { SuperTest, Test } from 'supertest';

describe('로그인 통합 테스트', () => {
  let app: Server;
  let loginForm: PhoneLogin;
  let agent: SuperTest<Test>;
  let cookie: string;

  beforeAll(async () => {
    app = await getTestServer();
    agent = request(app);
    loginForm = {
      phone: TestSignIn.TEST_REAL_PHONE,
      password: TestSignIn.PASSWORD,
    };
  });

  const agentPostWrap = (send: any) => agent.post(TestAPI.LOGIN).send(send);
  const agentPostWrapWithCookie = (api: string) =>
    agent
      .post(api)
      .set('Cookie', [`sid=${cookie}`])
      .send(loginForm);

  afterAll(async () => {
    app.close();
  });

  it('계정정보없이 패스워드만 입력하면 인증이 실패한다.', async () => {
    await agentPostWrap({ phone: loginForm.phone }).then((data) => {
      expect(data.statusCode).toBe(400);
    });
  });

  it('패스워드 없이 폰 또는 이메일만 입력하면 인증이 실패한다.', async () => {
    await agentPostWrap({ phone: loginForm.phone }).then((data) => {
      expect(data.statusCode).toBe(400);
    });
  });

  it('로그인이 성공되어 쿠키 값이 반환된다.', async () => {
    await agentPostWrap(loginForm).then(({ headers, statusCode }) => {
      const sidCookie = headers['set-cookie'][0].split(';')[0];
      cookie = sidCookie.slice(4);
      expect(sidCookie).toContain('sid');
      expect(statusCode).toBe(200);
    });
  });

  it('이미 로그인 되어있다면 실패한다.', async () => {
    await agentPostWrapWithCookie(TestAPI.LOGIN).then(
      ({ statusCode, body: { message } }) => {
        expect(statusCode).toBe(400);
        expect(message).toBe('로그인 한 사용자는 접근할 수 없습니다.');
      },
    );
  });

  it('로그아웃에 성공한다.', async () => {
    await agentPostWrapWithCookie(TestAPI.LOGOUT).then(
      ({ statusCode, body: { message } }) => {
        expect(statusCode).toBe(200);
        expect(message).toBe('로그아웃에 성공하였습니다.');
      },
    );
  });
});
