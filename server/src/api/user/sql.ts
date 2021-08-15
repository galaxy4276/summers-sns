import {
  AllUserProps,
  EmailSignInProps,
  PhoneSignInProps,
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

export const checkPrevUserByEmail = async (
  username: string,
  email: string,
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
  const isEmail = await getBoolAnyQueryPromise(
    conn.query(`SELECT email FROM \`summers-sns\`.users WHERE email = ?`, [
      email,
    ]),
    'email',
    false,
  );
  if (isEmail) return '이미 가입된 이메일입니다.';
};

export const checkPrevUserByPhone = async (
  username: string,
  phone: string,
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
  const isPhone = await getBoolAnyQueryPromise(
    conn.query(`SELECT phone FROM \`summers-sns\`.users WHERE phone = ?`, [
      phone,
    ]),
    'phone',
    false,
  );
  if (isPhone) return '이미 가입된 전화번호입니다.';
};
