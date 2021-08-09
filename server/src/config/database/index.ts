import { createConnection, ConnectionConfig, Connection } from 'mariadb';
import { config as loadEnvVariables } from 'dotenv';
import {
  createDatabaseSql,
  createUserTableSql,
  createPostTableSql,
  createPostLikerTableSql,
  createCommentLikerTableSql,
  createCommentTableSql,
  createFollowerTableSql,
  createFollowingTableSql,
  createUploadFileTableSql,
  createUserRoleTableSql,
  createAdminTableSql,
} from '@config/database/sql';
import { debug as log } from 'loglevel';

/**
 * @desc 데이터베이스 연결 객체를 반환하는 메서드를 포함한 클래스
 */
class DatabaseConnection {
  private conn?: Connection;

  private readonly config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
  }

  async initialize() {
    if (!this.conn) {
      throw Error('💥 database not connected! 💥');
    }

    try {
      await this.conn.beginTransaction();
      await this.conn.query(createDatabaseSql());
      await this.conn.query(createUserTableSql());
      await this.conn.query(createPostTableSql());
      await this.conn.query(createCommentTableSql());
      await this.conn.query(createPostLikerTableSql());
      await this.conn.query(createCommentLikerTableSql());
      await this.conn.query(createFollowerTableSql());
      await this.conn.query(createFollowingTableSql());
      await this.conn.query(createUploadFileTableSql());
      await this.conn.query(createUserRoleTableSql());
      await this.conn.query(createAdminTableSql());
      await this.conn.commit();
    } catch (err) {
      log(err);
      await this.conn
        .rollback()
        .then(() => log(`💥 wrong database initialize. 💥`));
    }
  }

  async connect() {
    this.conn = await createConnection(this.config);
  }

  getConnection() {
    return this.conn;
  }
}

/**
 * @desc 데이터베이스 객체 인스턴스를 반환하는 Factory 함수
 */
function getDatabaseConnection(): DatabaseConnection {
  loadEnvVariables();
  const config: ConnectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT as unknown as number,
  };

  return new DatabaseConnection(config);
}

const conn = getDatabaseConnection();

export default conn;
