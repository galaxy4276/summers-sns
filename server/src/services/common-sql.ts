import { mariadb } from '@config/index';
import { AllUserProps } from '@typings/user';

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
