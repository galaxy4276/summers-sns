import { AllUserProps, SignInProps } from '@typings/user';
import { databaseConnection } from '@config/index';
import { getBoolAnyQueryPromise } from '../../services'; // TODO: Path 수정

export const createUser = async (form: SignInProps): Promise<AllUserProps> => {
  try {
    const conn = databaseConnection.getConnection();
    await conn.beginTransaction();
    const { email, realname, username, password } = form;
    const { insertId }: { insertId: number } = await conn.query(
      `
      INSERT INTO \`summers-sns\`.users (
        email, realname, username, password, follower_count, following_count,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [email, realname, username, password, 0, 0, new Date(), new Date()],
    );
    return (
      await conn.query(`SELECT * FROM \`summers-sns\`.users WHERE id = ?;`, [
        insertId,
      ])
    )[0] as AllUserProps;
  } catch (err) {
    await databaseConnection.getConnection().rollback();
    throw new Error(err);
  }
};

export const checkPrevUser = async (
  username: string,
  email: string,
): Promise<string | void> => {
  const conn = databaseConnection.getConnection();
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
