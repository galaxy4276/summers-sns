import { mariadb } from '@config/index';
import { AllUserProps, SafeUserProps } from '@typings/user';
import { Context } from 'koa';

/**
 * @return 유저 객체 반환
 */
export async function getUserById(id: number): Promise<AllUserProps> {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    `SELECT * FROM \`summers-sns\`.users WHERE id = ?;`,
    [id],
  );
  await conn.end();
  return queryResult[0] as AllUserProps;
}

/**
 * @return 외부에 공개해도 되는 유저 객체를 반환
 */
export async function getSafeUserById(id: number): Promise<SafeUserProps> {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    `SELECT 
          id, email, phone, realname, username, follower_count, following_count
          FROM \`summers-sns\`.users 
          WHERE id = ?;`,
    [id],
  );
  await conn.end();
  return queryResult[0] as SafeUserProps;
}

/**
 * @return 유저 객체 반환
 */
export async function getUserByEmail(email: string): Promise<AllUserProps> {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    `SELECT * FROM \`summers-sns\`.users WHERE email = ?;`,
    [email],
  );
  await conn.end();
  return queryResult[0] as AllUserProps;
}

/**
 * @return 외부에 공개해도 되는 유저 객체를 반환
 */
export async function getSafeUserByEmail(
  email: string,
): Promise<SafeUserProps> {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    `SELECT 
          id, email, phone, realname, username, follower_count, following_count
          FROM \`summers-sns\`.users 
          WHERE email = ?;`,
    [email],
  );
  await conn.end();
  return queryResult[0] as SafeUserProps;
}

/**
 * @return 유저 객체 반환
 */
export async function getUserByPhone(
  phone: string | number,
): Promise<AllUserProps> {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    `SELECT * FROM \`summers-sns\`.users WHERE phone = ?;`,
    [phone],
  );
  await conn.end();
  return queryResult[0] as AllUserProps;
}

/**
 * @return 외부에 공개해도 되는 유저 객체를 반환
 */
export async function getSafeUserByPhone(
  phone: string | number,
): Promise<SafeUserProps> {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    `SELECT 
          id, email, phone, realname, username, follower_count, following_count
          FROM \`summers-sns\`.users 
          WHERE phone = ?;`,
    [phone],
  );
  await conn.end();
  return queryResult[0] as SafeUserProps;
}

/**
 * @desc ctx.body 를 참고하여 이메일 유저인 지 번호 유저인 지 판단합니다.
 * @return 유저 객체 반환
 */
export async function getUserByRule(
  ctx: Context,
): Promise<AllUserProps | undefined> {
  const { email, phone } = ctx.request.body;
  if (email) return getUserByEmail(email);
  if (phone) return getUserByPhone(phone);
}
