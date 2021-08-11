import { createConnection, ConnectionConfig, Connection } from 'mariadb';
import createDatabaseIfNotExists from '@config/database/sql';
import { debug as log } from 'loglevel';

/**
 * @desc 데이터베이스 연결 객체를 반환하는 메서드를 포함한 클래스
 */
export class DatabaseConnection {
  private conn?: Connection;

  async initialize(): Promise<void> {
    if (!this.conn?.isValid()) {
      throw Error('💥 database not connected! 💥');
    }

    try {
      await this.conn.beginTransaction();
      await createDatabaseIfNotExists(this.conn);
      await this.conn
        .commit()
        .then(() => log('successfully reflect ddl queries.'));
    } catch (err) {
      log(err);
      await this.conn
        .rollback()
        .then(() => log(`💥 wrong database initialize. 💥`));
    }
  }

  async connect(config: ConnectionConfig): Promise<void> {
    this.conn = await createConnection(config);
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
  return new DatabaseConnection();
}

const conn = getDatabaseConnection();

export default conn;
