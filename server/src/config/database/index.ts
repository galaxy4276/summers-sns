import { Pool, createPool } from 'mariadb';
import createDatabaseIfNotExists from '@config/database/sql';
import { debug as log } from 'loglevel';
import { config as loadEnvConfig } from 'dotenv';

/**
 * @desc 데이터베이스 연결 객체를 반환하는 메서드를 포함한 클래스
 */
export class DatabaseConnection {
  public pool: Pool;

  constructor() {
    loadEnvConfig();
    this.pool = createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  async initialize(): Promise<void> {
    if (!this.pool) {
      throw Error('💥 database not connected! 💥');
    }

    try {
      await createDatabaseIfNotExists(this.pool).then(() =>
        log('successfully reflect ddl queries.'),
      );
    } catch (err) {
      log(err);
      log(`💥 wrong database initialize. 💥`);
    }
  }
}

/**
 * @desc 데이터베이스 객체 인스턴스를 반환하는 Factory 함수
 */
export function getDatabaseConnection(): DatabaseConnection {
  return new DatabaseConnection();
}

const db = getDatabaseConnection();

export default db;
