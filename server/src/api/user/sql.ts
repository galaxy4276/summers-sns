import { SignInProps } from '@typings/user';
import { databaseConnection } from '@config/index';

// TODO: 타입 작업
export const createUserSql = async (form: SignInProps): Promise<any> => {
  const { email, realname, username, password } = form;
  const { insertId }: { insertId: number } = await databaseConnection
    .getConnection()
    .query(
      `
      INSERT INTO \`summers-sns\`.users (
        email, realname, username, password, follower_count, following_count,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [email, realname, username, password, 0, 0, new Date(), new Date()],
    );
  const [createdUser] = await databaseConnection
    .getConnection()
    .query(
      `SELECT username FROM \`summers-sns\`.users WHERE id = ${insertId};`,
    );
  return createdUser;
};

export default {};
