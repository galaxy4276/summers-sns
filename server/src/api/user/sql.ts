import {
  AllUserProps,
  EmailSignInProps,
  EmailUserRole,
  PhoneSignInProps,
  PhoneUserRole,
} from '@typings/user';
import { mariadb } from '@config/index';
import { getBoolAnyQueryPromise } from '../../services';

export const createUserByEmail = async (
  form: EmailSignInProps,
): Promise<AllUserProps> => {
  const conn = await mariadb.pool.getConnection();
  try {
    const { email, realname, username, password } = form;
    const { insertId }: { insertId: number } = await conn.query(
      `
      INSERT INTO \`summers-sns\`.users (
        email, phone, realname, username, password, follower_count, following_count,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [email, null, realname, username, password, 0, 0, new Date(), new Date()],
    );
    return (
      await conn.query(`SELECT * FROM \`summers-sns\`.users WHERE id = ?;`, [
        insertId,
      ])
    )[0] as AllUserProps;
  } catch (err) {
    throw new Error(err);
  }
};

export const createUserByPhone = async (
  form: PhoneSignInProps,
): Promise<AllUserProps> => {
  const conn = await mariadb.pool.getConnection();
  try {
    const { phone, realname, username, password } = form;
    const { insertId }: { insertId: number } = await conn.query(
      `
      INSERT INTO \`summers-sns\`.users (
        email, phone, realname, username, password, follower_count, following_count,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
      [null, phone, realname, username, password, 0, 0, new Date(), new Date()],
    );
    return (
      await conn.query(`SELECT * FROM \`summers-sns\`.users WHERE id = ?;`, [
        insertId,
      ])
    )[0] as AllUserProps;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * @desc 사용자 인증 정보를 생성합니다.
 * @return 생성된 사용자 번호를 반환합니다.
 */
export const createUserRole = async (
  email?: string,
  phone?: string,
): Promise<number | void> => {
  try {
    const conn = await mariadb.pool.getConnection();
    if (email) {
      const { insertId }: { insertId: number } = await conn.query(
        `
      INSERT  INTO \`summers-sns\`.user_verifies (email) VALUES (?);
    `,
        [email],
      );
      return insertId;
    }
    if (phone) {
      const { insertId }: { insertId: number } = await conn.query(
        `
      INSERT  INTO \`summers-sns\`.user_verifies (phone) VALUES (?);
    `,
        [phone],
      );
      return insertId;
    }
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * @desc 사용자와 사용자 정보 테이블에서 target 에 해당하는 데이터가 이미 존재하는 지 검사합니다.
 * @return 에러 유무를 string 으로 전달합니다. ( 없으면 void )
 */
export const checkPrevUserProps = async (
  username: string,
  checkProp: string,
  target: string,
  tableName: 'users' | 'user_verifies',
): Promise<string | void> => {
  const conn = await mariadb.pool.getConnection();
  const isUsername = await getBoolAnyQueryPromise(
    conn.query(
      `
    SELECT username FROM \`summers-sns\`.users WHERE username = ?
  `,
      [username],
    ),
    'username',
    false,
  );
  if (isUsername) return '이미 존재하는 사용자 이름입니다.';
  const isCheckProp = await getBoolAnyQueryPromise(
    conn.query(
      `
    SELECT ? FROM \`summers-sns\`.? WHERE ? = ?
  `,
      [checkProp, tableName, checkProp, target],
    ),
    'username',
    false,
  );

  if (isCheckProp) {
    if (checkProp === 'email') return '이미 가입된 이메일입니다.';
    if (checkProp === 'phone') return '이미 가입된 번호입니다.';
  }
};

/**
 * @desc 사용자 인증 정보가 이미 존재하는 지 Sql 을 실행하여 검사합니다.
 * @return 오류메시지 에 대해 string 으로 반환합니다. ( 없으면 void )
 */
export const getBoolCheckPrevUserRole = async (
  form: EmailUserRole | PhoneUserRole,
): Promise<string | void> => {
  const conn = await mariadb.pool.getConnection();
  if ('email' in form) {
    const isPrevEmail = await getBoolAnyQueryPromise(
      conn.query(
        `SELECT email FROM \`summers-sns\`.user_verifies WHERE email = ?`,
        [form.email],
      ),
      'email',
      false,
    );
    if (isPrevEmail) return '이미 가입된 이메일입니다.';
  }

  if ('phone' in form) {
    const isPrevPhone = await getBoolAnyQueryPromise(
      conn.query(
        `SELECT phone FROM \`summers-sns\`.user_verifies WHERE phone = ?`,
        [form.phone],
      ),
      'phone',
      false,
    );
    if (isPrevPhone) return '이미 가입된 번호입니다.';
  }
};
