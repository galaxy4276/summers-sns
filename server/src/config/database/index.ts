import { createConnection, ConnectionConfig, Connection } from 'mariadb';
import { config as loadEnvVariables } from 'dotenv';
import createDatabaseIfNotExists from '@config/database/sql';
import { debug as log } from 'loglevel';

/**
 * @desc 데이터베이스 연결 객체를 반환하는 메서드를 포함한 클래스
 */
export class DatabaseConnection {
  private conn?: Connection;

  private readonly config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.conn?.isValid()) {
      throw Error('💥 database not connected! 💥');
    }

    try {
      await this.conn.beginTransaction();
      await createDatabaseIfNotExists(this.conn);
      await this.conn.commit().then(() => {
        if (process.env.NODE_ENV === 'development') {
          log('successfully reflect ddl queries.');
        }
      });
    } catch (err) {
      log(err);
      await this.conn
        .rollback()
        .then(() => log(`💥 wrong database initialize. 💥`));
    }
  }

  async connect(): Promise<void> {
    this.conn = await createConnection(this.config);
  }

  getConnection(): Connection {
    if (this.conn?.isValid()) {
      return this.conn;
    }
    throw Error('💥 database not connected! 💥');
  }
}

/**
 * @desc 데이터베이스 객체 인스턴스를 반환하는 Factory 함수
 */
export function getDatabaseConnection(): DatabaseConnection {
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
