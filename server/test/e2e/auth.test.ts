import {
  EmailSignInProps,
  EmailUser,
  PhoneSignInProps,
  PhoneUser,
} from '@typings/user';
import { TestAPI, TestSignIn } from '@test/enum';
import clearAccounts from '@test/auth/clear-database';
import request from 'supertest';
import {
  getUserVerifiesIdByEmailSql,
  getUserVerifiesIdByPhoneSql,
  isVerifiedAccount,
  setActivateUserVerifies,
} from '@api/user/sql';
import { Server } from 'http';
import getTestServer from '@test/app';

describe('인증 테스트', () => {
  let app: Server;
  let emailForm: EmailUser;
  let phoneForm: PhoneUser;
  let emailSignInForm: EmailSignInProps;
  let phoneSignInForm: PhoneSignInProps;

  beforeAll(async () => {
    app = await getTestServer();
    emailSignInForm = {
      email: TestSignIn.EMAIL,
      realname: 'realtest',
      username: 'test12',
      password: 'test1234',
    };
    phoneSignInForm = {
      phone: TestSignIn.PHONE,
      realname: 'realtest',
      username: 'test123',
      password: 'test1234',
    };
    emailForm = { email: TestSignIn.EMAIL };
    phoneForm = { phone: TestSignIn.PHONE };
  });

  afterAll(async () => {
    app.close();
    await clearAccounts(TestSignIn.EMAIL, TestSignIn.PHONE);
  });

  describe('사용자 인증 정보 테스트', () => {
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
          expect(data.statusCode).toBe(201);
        });
    });

    it('이미 생성된 폰 정보로 사용자 인증 정보를 생성할 수 없다.', async () => {
      await request(app)
        .post(TestAPI.CREATE_CREDENTIALS)
        .send({
          ...phoneForm,
          isTest: true,
        })
        .then((data) => {
          expect(data.statusCode).toBe(400);
        });
    });
  });

  describe('입력 값 검증', () => {
    describe('회원가입 입력 값 검증', () => {
      it('이메일 회원가입에 이메일 정보가 없으면 실패한다.', async () => {
        const testForm: Omit<EmailSignInProps, 'email'> = {
          username: emailSignInForm.username,
          password: emailSignInForm.password,
          realname: emailSignInForm.realname,
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('번호 회원가입에 번호 정보가 없으면 실패한다.', async () => {
        const testForm: Omit<PhoneSignInProps, 'phone'> = {
          username: emailSignInForm.username,
          password: emailSignInForm.password,
          realname: emailSignInForm.realname,
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('username 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<EmailSignInProps, 'username'> = {
          email: emailSignInForm.email,
          password: emailSignInForm.password,
          realname: emailSignInForm.realname,
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('username 길이가 3글자 미만이면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          username: 'th',
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('username 길이가 10글자를 넘으면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          username: 'iamgreatherthan10characters',
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('realname 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<EmailSignInProps, 'realname'> = {
          email: emailSignInForm.email,
          password: emailSignInForm.password,
          username: emailSignInForm.username,
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('realname 길이가 3글자 미만이면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          realname: 'th',
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('realname 길이가 30글자를 초과면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          realname:
            'iamgreatherthan30charactersiamgreatherthan30charactersiamgreatherthan30charactersiamgreatherthan30characters',
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('password 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<EmailSignInProps, 'password'> = {
          email: emailSignInForm.email,
          username: emailSignInForm.username,
          realname: emailSignInForm.realname,
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('password 길이가 8글자 미만이면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          password: 'eightee',
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });

      it('password 길이가 50글자 초과면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          realname: 'fifteenfifteenfifteenfifteenfifteenfifteenfifteenfifteen',
        };
        await request(app)
          .post(TestAPI.SIGN_IN)
          .send(testForm)
          .then(({ statusCode }) => {
            expect(statusCode).toBe(400);
          });
      });
    });
  });

  describe('회원가입 기능 테스트', () => {
    it('인증되지 않은 이메일 유저는 가입되지 않는다.', async () => {
      await request(app)
        .post(TestAPI.SIGN_IN)
        .send(emailSignInForm)
        .then(({ statusCode }) => {
          expect(statusCode).toBe(400);
        });
    });

    it('이메일 계정을 인증한다.', async () => {
      const { id } = await getUserVerifiesIdByEmailSql(emailSignInForm.email);
      await setActivateUserVerifies(id);
      const isVerified = Boolean(await isVerifiedAccount(id));
      expect(isVerified).toBeTruthy();
    });

    it('테스트 계정이 이메일로 회원가입 된다.', async () => {
      await request(app)
        .post(TestAPI.SIGN_IN)
        .send(emailSignInForm)
        .then(({ statusCode }) => {
          expect(statusCode).toBe(201);
        });
    });

    it('이메일로 이미 가입된 대상은 가입되지 않는다.', async () => {
      await request(app)
        .post(TestAPI.SIGN_IN)
        .send({
          ...emailSignInForm,
          username: 'bear1',
        })
        .then(({ statusCode }) => {
          expect(statusCode).toBe(400);
        });
    });

    it('인증되지 않은 번호 유저는 가입되지 않는다.', async () => {
      await request(app)
        .post(TestAPI.SIGN_IN)
        .send(phoneSignInForm)
        .then((data) => {
          expect(data.statusCode).toBe(400);
        });
    });

    it('인증되지 않은 폰 계정은 가입되지 않는다.', async () => {
      await request(app)
        .post(TestAPI.SIGN_IN)
        .send(phoneSignInForm)
        .then(({ statusCode }) => {
          expect(statusCode).toBe(400);
        });
    });

    it('폰 계정을 인증한다.', async () => {
      const { id } = await getUserVerifiesIdByPhoneSql(phoneSignInForm.phone);
      await setActivateUserVerifies(id);
      const isVerified = Boolean(await isVerifiedAccount(id));
      expect(isVerified).toBeTruthy();
    });

    it('테스트 계정이 번호로 회원가입 된다.', async () => {
      await request(app)
        .post(TestAPI.SIGN_IN)
        .send(phoneSignInForm)
        .then(({ statusCode }) => {
          expect(statusCode).toBe(201);
        });
    });

    it('번호로 가입된 대상은 가입되지 않는다.', async () => {
      await request(app)
        .post(TestAPI.SIGN_IN)
        .send({
          ...phoneSignInForm,
          username: 'bear2',
        })
        .then(({ statusCode }) => {
          expect(statusCode).toBe(400);
        });
    });
  });
});
