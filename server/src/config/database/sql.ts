import { Pool } from 'mariadb';

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
     email           VARCHAR(255) NOT NULL,
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
};

export default createDatabaseIfNotExists;
