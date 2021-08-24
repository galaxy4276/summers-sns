import { AllUserProps } from '@typings/user';
import { Connection, PoolConnection } from 'mariadb';
import { mariadb } from '@config/index';

/**
 * @desc 이메일로 사용자 유저 정보를 찾는다.
 * @return 사용자 정보 객체를 반환합니다.
 */
export const getUserByEmail = async (
  conn: PoolConnection,
  email: string,
): Promise<AllUserProps> => {
  const user = (
    await conn.query(
      `
  SELECT * FROM \`summers-sns\`.users WHERE email = ?
  `,
      [email],
    )
  )[0] as AllUserProps;

  return user;
};

/**
 * @desc 폰 번호로 사용자 유저 정보를 찾는다.
 * @return 사용자 정보 객체를 반환합니다.
 */
export const getUserByPhone = async (
  conn: PoolConnection,
  phone: string | number,
): Promise<AllUserProps> => {
  const user = (
    await conn.query(
      `
  SELECT * FROM \`summers-sns\`.users WHERE phone = ?
  `,
      [phone],
    )
  )[0] as AllUserProps;

  return user;
};

/**
 * @desc 테스트에 사용된 계정들에 대해 DELETE Queries 를 수행합니다.
 */
export const deleteTestUsersInfo = (
  conn: Connection,
  emailAccId: number,
  email: string,
  phoneAccId: number,
  phone: string | number,
): void => {
  conn.query(
    `
    DELETE FROM \`summers-sns\`.user_roles WHERE user_id = ?
  `,
    [phoneAccId],
  );
  conn.query(
    `
    DELETE FROM \`summers-sns\`.user_verifies WHERE email = ?
  `,
    [email],
  );
  conn.query(
    `
    DELETE FROM \`summers-sns\`.user_verifies WHERE phone = ?
  `,
    [phone],
  );
  conn.query(
    `
    DELETE FROM \`summers-sns\`.users WHERE id = ?
  `,
    [emailAccId],
  );
  conn.query(
    `
    DELETE FROM \`summers-sns\`.users WHERE id = ?
  `,
    [phoneAccId],
  );
};

/**
 * @desc 테스트에 사용된 계정들에 대해 트랜잭션이 설정된 DELETE SQL Queries 를 수행합니다.
 */
export default async function clearAccounts(
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
  await conn
    .beginTransaction()
    .then(() => {
      deleteTestUsersInfo(conn, emailAccId, email, phoneAccId, phone);
    })
    .then(() => conn.commit())
    .catch((err) => {
      console.error(err);
      conn.rollback();
    });
  await conn.end();
}
