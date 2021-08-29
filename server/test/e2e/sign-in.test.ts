import {
  EmailSignInProps,
  EmailUser,
  PhoneSignInProps,
  PhoneUser,
} from '@typings/user';
import { TestAPI, TestSignIn } from '@test/helper/enum';
import clearAccounts from '@test/auth/clear-database';
import request, { Test, SuperTest } from 'supertest';
import {
  getUserVerifiesIdByEmailSql,
  getUserVerifiesIdByPhoneSql,
  isVerifiedAccount,
  setActivateUserVerifies,
} from '@api/auth/sql';
import { Server } from 'http';
import getTestServer from '@test/helper/app';
import {
  expectAlreadyStatusCode,
  expectBadStatusCode,
  expectCreatedStatusCode,
  expectMissFormStatusCode,
} from '@test/helper/util';

const { CREATE_CREDENTIALS, SIGN_IN } = TestAPI;

describe('인증 테스트', () => {
  let app: Server;
  let emailForm: EmailUser;
  let phoneForm: PhoneUser;
  let emailSignInForm: EmailSignInProps;
  let phoneSignInForm: PhoneSignInProps;
  let agent: SuperTest<Test>;

  beforeAll(async () => {
    app = await getTestServer();
    agent = request(app);
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

  const sendPost = (api: string, send: any) => agent.post(api).send(send);

  afterAll(async () => {
    app.close();
    await clearAccounts(TestSignIn.EMAIL, TestSignIn.PHONE);
  });

  describe('사용자 인증 정보 테스트', () => {
    describe('사용자 인증 정보 생성 값 검증 테스트', () => {
      it('이메일과 번호 정보를 모두 포함 시 실패한다.', async () => {
        await sendPost(CREATE_CREDENTIALS, {
          phone: phoneForm.phone,
          email: emailForm.email,
        }).then(expectMissFormStatusCode);
      });

      it('이메일 정보 생성요청 시 이메일형식이 아니면 실패한다.', async () => {
        await sendPost(CREATE_CREDENTIALS, { email: 'thisIsEmail' }).then(
          expectMissFormStatusCode,
        );
      });
    });
  });

  describe('사용자 인증 정보 생성 기능 테스트', () => {
    it('이메일 정보로 사용자 인증 정보를 생성한다.', async () => {
      await sendPost(CREATE_CREDENTIALS, emailForm).then((data) => {
        expect(data.statusCode).toBe(201);
        expect(typeof data.body.createdCredentialsId).toBe('number');
      });
    });

    it('이미 생성된 이메일 정보로 사용자 인증 정보를 생성할 수 없다.', async () => {
      await sendPost(CREATE_CREDENTIALS, emailForm).then(
        expectAlreadyStatusCode,
      );
    });

    it('폰 정보로 사용자 인증 정보를 생성한다.', async () => {
      await sendPost(CREATE_CREDENTIALS, { ...phoneForm, isTest: true }).then(
        expectCreatedStatusCode,
      );
    });

    it('이미 생성된 폰 정보로 사용자 인증 정보를 생성할 수 없다.', async () => {
      await sendPost(CREATE_CREDENTIALS, { ...phoneForm, isTest: true }).then(
        expectAlreadyStatusCode,
      );
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
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('번호 회원가입에 번호 정보가 없으면 실패한다.', async () => {
        const testForm: Omit<PhoneSignInProps, 'phone'> = {
          username: emailSignInForm.username,
          password: emailSignInForm.password,
          realname: emailSignInForm.realname,
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('username 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<EmailSignInProps, 'username'> = {
          email: emailSignInForm.email,
          password: emailSignInForm.password,
          realname: emailSignInForm.realname,
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('username 길이가 3글자 미만이면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          username: 'th',
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('username 길이가 10글자를 넘으면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          username: 'iamgreatherthan10characters',
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('realname 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<EmailSignInProps, 'realname'> = {
          email: emailSignInForm.email,
          password: emailSignInForm.password,
          username: emailSignInForm.username,
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('realname 길이가 3글자 미만이면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          realname: 'th',
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('realname 길이가 30글자를 초과면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          realname:
            'iamgreatherthan30charactersiamgreatherthan30charactersiamgreatherthan30charactersiamgreatherthan30characters',
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('password 항목이 없으면 실패한다.', async () => {
        const testForm: Omit<EmailSignInProps, 'password'> = {
          email: emailSignInForm.email,
          username: emailSignInForm.username,
          realname: emailSignInForm.realname,
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('password 길이가 8글자 미만이면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          password: 'eightee',
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });

      it('password 길이가 50글자 초과면 실패한다.', async () => {
        const testForm: EmailSignInProps = {
          ...emailSignInForm,
          realname: 'fifteenfifteenfifteenfifteenfifteenfifteenfifteenfifteen',
        };
        await sendPost(SIGN_IN, testForm).then(expectMissFormStatusCode);
      });
    });
  });

  describe('회원가입 기능 테스트', () => {
    it('인증되지 않은 이메일 유저는 가입되지 않는다.', async () => {
      await sendPost(SIGN_IN, emailSignInForm).then(expectBadStatusCode);
    });

    it('이메일 계정을 인증한다.', async () => {
      const { id } = await getUserVerifiesIdByEmailSql(emailSignInForm.email);
      await setActivateUserVerifies(id);
      const isVerified = Boolean(await isVerifiedAccount(id));
      expect(isVerified).toBeTruthy();
    });

    it('테스트 계정이 이메일로 회원가입 된다.', async () => {
      await sendPost(SIGN_IN, emailSignInForm).then(expectCreatedStatusCode);
    });

    it('이메일로 이미 가입된 대상은 가입되지 않는다.', async () => {
      await sendPost(SIGN_IN, { ...emailSignInForm, username: 'bear1' }).then(
        expectAlreadyStatusCode,
      );
    });

    it('인증되지 않은 폰 계정은 가입되지 않는다.', async () => {
      await sendPost(SIGN_IN, phoneSignInForm).then(expectBadStatusCode);
    });

    it('폰 계정을 인증한다.', async () => {
      const { id } = await getUserVerifiesIdByPhoneSql(phoneSignInForm.phone);
      await setActivateUserVerifies(id);
      const isVerified = Boolean(await isVerifiedAccount(id));
      expect(isVerified).toBeTruthy();
    });

    it('테스트 계정이 번호로 회원가입 된다.', async () => {
      await sendPost(SIGN_IN, phoneSignInForm).then(expectCreatedStatusCode);
    });

    it('번호로 가입된 대상은 가입되지 않는다.', async () => {
      await sendPost(SIGN_IN, { ...phoneSignInForm, username: 'bear2' }).then(
        expectAlreadyStatusCode,
      );
    });
  });
});
