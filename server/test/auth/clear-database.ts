import { DatabaseConnection } from '@config/database';
import { AllUserProps } from '@typings/user';
import { PoolConnection } from 'mariadb';

/**
 * @desc 이메일로 사용자 유저 정보를 찾는다.
 * @return 사용자 정보 객체를 반환합니다.
 */
export const getUserByEmail = async (
  mariadb: PoolConnection,
  email: string,
): Promise<AllUserProps> => {
  const user = (
    await mariadb.query(
      `
  SELECT * FROM \`summers-sns\`.users WHERE email = ?
  `,
      [email],
    )
  )[0] as AllUserProps;

  await mariadb.end();
  return user;
};

/**
 * @desc 폰 번호로 사용자 유저 정보를 찾는다.
 * @return 사용자 정보 객체를 반환합니다.
 */
export const getUserByPhone = async (
  mariadb: PoolConnection,
  phone: string | number,
): Promise<AllUserProps> => {
  const user = (
    await mariadb.query(
      `
  SELECT * FROM \`summers-sns\`.users WHERE phone = ?
  `,
      [phone],
    )
  )[0] as AllUserProps;

  await mariadb.end();
  return user;
};

export default async function clearAccounts(
  mariadb: DatabaseConnection,
  email: string,
  phone: string | number,
): Promise<void> {
  const conn = await mariadb.pool.getConnection();
  const { id: emailAccId } = await getUserByEmail(conn, email);
  const { id: phoneAccId } = await getUserByPhone(conn, phone);
  await conn.query(
    `
    DELETE FROM \`summers-sns\`.user_roles WHERE user_id = ?
  `,
    [emailAccId],
  );
  await conn.query(
    `
    DELETE FROM \`summers-sns\`.user_roles WHERE user_id = ?
  `,
    [phoneAccId],
  );
  await conn.query(
    `
    DELETE FROM \`summers-sns\`.user_verifies WHERE email = ?
  `,
    [email],
  );
  await conn.query(
    `
    DELETE FROM \`summers-sns\`.user_verifies WHERE phone = ?
  `,
    [phone],
  );
  await conn.query(
    `
    DELETE FROM \`summers-sns\`.users WHERE id = ?
  `,
    [emailAccId],
  );
  await conn.query(
    `
    DELETE FROM \`summers-sns\`.users WHERE id = ?
  `,
    [phoneAccId],
  );
  await conn.end();
}
