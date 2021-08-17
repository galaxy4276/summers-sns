import {
  AllUserProps,
  EmailSignInProps,
  EmailUser,
  PhoneSignInProps,
  PhoneUser,
  UserVerify,
  UserVerifyCivKeyReturnType,
} from '@typings/user';
import { mariadb } from '@config/index';
import {
  getBoolAnyQueryByTargetPromise,
  getBoolAnyQueryPromise,
} from '../../services';

/**
 * @desc 이메일 정보로 사용자를 생성합니다.
 * @return 사용자 정보 객체
 */
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
    const user = (
      await conn.query(`SELECT * FROM \`summers-sns\`.users WHERE id = ?;`, [
        insertId,
      ])
    )[0] as AllUserProps;
    await conn.end();
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * @desc 번호로 사용자를 생성합니다.
 * @return 사용자 정보 객체
 */
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
    const user = (
      await conn.query(`SELECT * FROM \`summers-sns\`.users WHERE id = ?;`, [
        insertId,
      ])
    )[0] as AllUserProps;
    await conn.end();
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * @desc 사용자 상세 정보를 생성합니다. ( 어드민 관리 )
 * @return void
 */
export const createUserRole = async (userId: number): Promise<void> => {
  const conn = await mariadb.pool.getConnection();
  await conn.query(
    `
  INSERT INTO \`summers-sns\`.user_roles (user_id) VALUES (?);
  `,
    [userId],
  );
  await conn.end();
};

/**
 * @desc 사용자 인증 정보를 생성합니다.
 * @return 생성된 사용자 번호를 반환합니다.
 */
export const createUserCredentials = async (
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
 * @desc 사용자 이름이 이미 가입되어 있는 지 판단합니다.
 */
export const checkPrevUserByUsername = async (
  username: string,
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
};

/**
 * @desc 사용자 이메일이 이미 가입되어 있는 지 판단합니다.
 */
export const checkPrevUserByEmail = async (
  email: string,
): Promise<string | void> => {
  const conn = await mariadb.pool.getConnection();
  const isEmail = await getBoolAnyQueryPromise(
    conn.query(`SELECT email FROM \`summers-sns\`.users WHERE email = ?`, [
      email,
    ]),
    'email',
    false,
  );

  await conn.end();
  if (isEmail) return '이미 가입된 이메일입니다.';
};

/**
 * @desc 사용자 번호가 이미 가입되어 있는 지 판단합니다.
 */
export const checkPrevUserByPhone = async (
  phone: string | number,
): Promise<string | void> => {
  const conn = await mariadb.pool.getConnection();
  const isPhone = await getBoolAnyQueryPromise(
    conn.query(
      `
            SELECT phone FROM \`summers-sns\`.users WHERE phone = ?
      `,
      [phone],
    ),
    'phone',
    false,
  );

  await conn.end();
  if (isPhone) return '이미 가입된 번호입니다.';
};

/**
 * @desc 사용자 인증 정보가 이미 존재하는 지 Sql 을 실행하여 검사합니다.
 * @return 오류메시지 에 대해 string 으로 반환합니다. ( 없으면 void )
 */
export const getBoolCheckPrevUserRole = async (
  form: EmailUser | PhoneUser,
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

/**
 * @desc 해당 번호를 가진 user_verifies 항목의 아이디를 가져오는 Sql 을 실행합니다.
 * @return UserVerify 타입의 객체를 반환합니다.
 */
export const getUserVerifiesIdByPhoneSql = async (
  phone: string | number,
): Promise<UserVerify> => {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    `SELECT * FROM \`summers-sns\`.user_verifies WHERE phone = ?`,
    [phone],
  );
  return queryResult[0] as UserVerify;
};

/**
 * @desc 해당 이메일을 가진 user_verifies 항목의 아이디를 가져오는 Sql 을 실행합니다.
 * @return UserVerify 타입의 객체를 반환합니다.
 */
export const getUserVerifiesIdByEmailSql = async (
  email: string,
): Promise<UserVerify> => {
  const conn = await mariadb.pool.getConnection();
  const queryResult = await conn.query(
    'SELECT * FROM `summers-sns`.user_verifies WHERE email = ?',
    [email],
  );
  await conn.end();
  return queryResult[0] as UserVerify;
};

/**
 * @desc 사용자 인증 정보에 암호 키를 추가 저장합니다.
 */
export const setUserVerifiesKey = async (
  id: number,
  civ: string,
): Promise<void> => {
  const conn = await mariadb.pool.getConnection();
  await conn.query(
    `UPDATE \`summers-sns\`.user_verifies SET civ_key = ? WHERE id = ?`,
    [civ, id],
  );
  await conn.end();
};

/**
 * @desc 사용자 인증 정보가 활성화(true) 상태인 지 bool 값으로 반환합니다.
 */
export const isVerifiedAccount = async (id: number): Promise<boolean> => {
  const conn = await mariadb.pool.getConnection();
  const isVerified = await getBoolAnyQueryByTargetPromise(
    conn.query(
      `
      SELECT is_verified FROM \`summers-sns\`.user_verifies WHERE id = ?
    `,
      [id],
    ),
    'is_verified',
    1,
    false,
  );
  await conn.end();
  return isVerified;
};

/**
 * @desc 사용자 인증 정보에서 civ_key 항목을 빼내옵니다.
 */
export const getUserVerifiesCivKeyByEmail = async (
  email: string,
): Promise<UserVerifyCivKeyReturnType> => {
  const conn = await mariadb.pool.getConnection();
  const userVerify = await conn.query(
    `
    SELECT civ_key, id FROM \`summers-sns\`.user_verifies WHERE email = ?
  `,
    [email],
  );
  await conn.end();
  return userVerify[0] as UserVerifyCivKeyReturnType;
};

/**
 * @desc 사용자 인증 정보에서 civ_key 항목을 빼내옵니다.
 */
export const getUserVerifiesCivKeyByPhone = async (
  phone: string | number,
): Promise<UserVerifyCivKeyReturnType> => {
  const conn = await mariadb.pool.getConnection();
  const userVerify = await conn.query(
    `
    SELECT civ_key, id FROM \`summers-sns\`.user_verifies WHERE phone = ?
  `,
    [phone],
  );
  await conn.end();
  return userVerify[0] as UserVerifyCivKeyReturnType;
};

/**
 * @desc 사용자 인증 정보에서 인증정보를 활성화 합니다.
 */
export const setActivateUserVerifies = async (id: number) => {
  const conn = await mariadb.pool.getConnection();
  await conn.query(
    `UPDATE \`summers-sns\`.user_verifies SET is_verified = ? WHERE id = ?`,
    [true, id],
  );
  await conn.end();
};
