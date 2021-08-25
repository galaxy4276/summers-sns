import { Pool } from 'mariadb';
import { hashPlainText } from '@services/index';
import { TestSignIn } from '@test/helper/enum';

const createDatabaseSqlIfNotExists = () =>
  `
    CREATE DATABASE IF NOT EXISTS \`summers-sns\`
      DEFAULT CHARACTER SET utf8mb4
      COLLATE utf8mb4_general_ci;
  `;

const createUserTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`users\`
  (
     id              INT(11) AUTO_INCREMENT NOT NULL,
     email           VARCHAR(255) NULL,
     phone           VARCHAR(40) NULL,
     realname        VARCHAR(30) NOT NULL,
     username        VARCHAR(30) UNIQUE NOT NULL,
     password        VARCHAR(255) NOT NULL,
     follower_count  INT(11) DEFAULT 0 NOT NULL,
     following_count INT(11) DEFAULT 0 NOT NULL,
     created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     deleted_at      TIMESTAMP NULL,
     CONSTRAINT pk_users PRIMARY KEY(id)
  );`;

const createPostTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`posts\`
  (
     id         INT(11) AUTO_INCREMENT NOT NULL,
     user_id    INT(11) NOT NULL,
     content    VARCHAR(500) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     deleted_at TIMESTAMP NULL,
     CONSTRAINT pk_posts PRIMARY KEY(id),
     FOREIGN KEY(user_id) REFERENCES \`users\`(id)
  );`;

const createFollowerTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`followers\`
  (
     id          INT(11) AUTO_INCREMENT NOT NULL,
     created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     user_id     INT(11) NOT NULL,
     follower_id INT(11) NOT NULL,
     CONSTRAINT pk_followers PRIMARY KEY(id),
     FOREIGN KEY(user_id) REFERENCES \`users\`(id),
     FOREIGN KEY(follower_id) REFERENCES \`users\`(id)
  );`;

const createFollowingTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`followings\`
  (
     id           INT(11) AUTO_INCREMENT NOT NULL,
     created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     user_id      INT(11) NOT NULL,
     following_id INT(11) NOT NULL,
     CONSTRAINT pk_followings PRIMARY KEY(id),
     FOREIGN KEY(user_id) REFERENCES \`users\`(id),
     FOREIGN KEY(following_id) REFERENCES \`users\`(id)
  );`;

const createUploadFileTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`upload_files\`
  (
     id         INT(11) AUTO_INCREMENT NOT NULL,
     post_id    INT(11) NOT NULL,
     filename   VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     deleted_at TIMESTAMP NULL,
     CONSTRAINT pk_upload_files PRIMARY KEY(id),
     FOREIGN KEY(post_id) REFERENCES \`posts\`(id)
  );`;

const createCommentTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`comments\`
  (
     id         INT(11) AUTO_INCREMENT NOT NULL,
     user_id    INT(11) NOT NULL,
     post_id    INT(11) NOT NULL,
     content    VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     deleted_at TIMESTAMP NULL,
     CONSTRAINT pk_comments PRIMARY KEY(id),
     FOREIGN KEY(user_id) REFERENCES \`users\`(id),
     FOREIGN KEY(post_id) REFERENCES \`posts\`(id)
  );`;

const createPostLikerTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`post_likers\`
  (
     id         INT(11) AUTO_INCREMENT NOT NULL,
     user_id    INT(11) NOT NULL,
     post_id    INT(11) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     deleted_at TIMESTAMP NULL,
     CONSTRAINT pk_post_likers PRIMARY KEY(id),
     FOREIGN KEY(user_id) REFERENCES \`users\`(id),
     FOREIGN KEY(post_id) REFERENCES \`posts\`(id)
  );`;

const createCommentLikerTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`comment_likers\`
  (
     id         INT(11) AUTO_INCREMENT NOT NULL,
     user_id    INT(11) NOT NULL,
     comment_id INT(11) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     deleted_at TIMESTAMP NULL,
     CONSTRAINT pk_comment_likers PRIMARY KEY(id),
     FOREIGN KEY(user_id) REFERENCES \`users\`(id),
     FOREIGN KEY(comment_id) REFERENCES \`comments\`(id)
  );`;

const createUserRoleTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`user_roles\`
  (
     id         INT(11) AUTO_INCREMENT NOT NULL,
     user_id    INT(11) NOT NULL,
     updated_at TIMESTAMP NULL,
     expired_at TIMESTAMP NULL,
     CONSTRAINT pk_user_roles PRIMARY KEY(id),
     FOREIGN KEY(user_id) REFERENCES \`users\`(id)
  );
`;

const createAdminTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`admins\`
  (
     id         INT(11) AUTO_INCREMENT NOT NULL,
     username   VARCHAR(15) UNIQUE NOT NULL,
     password   VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     expired_at TIMESTAMP NULL,
     CONSTRAINT pk_user_admins PRIMARY KEY(id)
  );`;

// TODO: email, phone 에 index 적용
const createUserVerifyTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`user_verifies\`
   (
     id              INT(11) AUTO_INCREMENT NOT NULL,
     email           VARCHAR(255) UNIQUE NULL,
     phone           VARCHAR(40) UNIQUE NULL,
     is_verified     BOOLEAN NOT NULL DEFAULT false,
     civ_key             VARCHAR(10) NULL,
     CONSTRAINT pk_user_verified PRIMARY KEY(id)
   );`;

const createSessionStoreTableSql = () =>
  `CREATE TABLE IF NOT EXISTS \`summers-sns\`.\`session_store\`
   (
     id              INT(11) AUTO_INCREMENT NOT NULL,
     session_id      VARCHAR(255) NOT NULL,
     user_id         INT(11) NOT NULL,
     CONSTRAINT pk_session_store PRIMARY KEY(id)
   )`;

const createTestUserVerifiesData = () =>
  `
    INSERT INTO \`summers-sns\`.user_verifies (email, phone, is_verified, civ_key)
    SELECT null, '01011223344', 1, 123456
    FROM DUAL
    WHERE NOT EXISTS
        (
            SELECT phone
            FROM \`summers-sns\`.user_verifies
            WHERE phone = '01011223344'
        );
  `;

const createTestUserData = async () => {
  const password = await hashPlainText('test12', 4);
  const query = `
    INSERT INTO \`summers-sns\`.users (email, phone, realname, username, password)
    SELECT null, ${TestSignIn.PHONE}, '박봉팔', 'bonpal12', ?
    FROM DUAL
    WHERE NOT EXISTS
        (
            SELECT phone
            FROM \`summers-sns\`.users
            WHERE phone = ${TestSignIn.PHONE}
        );
  `;
  return { password, query };
};

const createTestUserRoleData = () => {
  return `
    INSERT INTO \`summers-sns\`.user_roles (user_id, updated_at, expired_at)
    SELECT (
        SELECT id
        FROM \`summers-sns\`.users
        WHERE phone = ${TestSignIn.PHONE}
    ),
    null,
    null
    FROM DUAL
    WHERE NOT EXISTS
        (
            SELECT phone
            FROM \`summers-sns\`.user_verifies
            WHERE phone = ${TestSignIn.PHONE}
        );
  `;
};

const createDatabaseIfNotExists = async (conn: Pool): Promise<void> => {
  await conn.query(createDatabaseSqlIfNotExists());
  await conn.query(createUserTableSql());
  await conn.query(createPostTableSql());
  await conn.query(createCommentTableSql());
  await conn.query(createPostLikerTableSql());
  await conn.query(createCommentLikerTableSql());
  await conn.query(createFollowerTableSql());
  await conn.query(createFollowingTableSql());
  await conn.query(createUploadFileTableSql());
  await conn.query(createUserRoleTableSql());
  await conn.query(createAdminTableSql());
  await conn.query(createUserVerifyTableSql());
  await conn.query(createSessionStoreTableSql());

  await conn.query(createTestUserVerifiesData());
  const { query: userQuery, password } = await createTestUserData();
  await conn.query(userQuery, password);
  await conn.query(createTestUserRoleData());
};

export default createDatabaseIfNotExists;
