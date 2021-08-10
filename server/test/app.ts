import getKoaServer from '@config/application';
import { DatabaseConnection, getDatabaseConnection } from '@config/database';
import { Server } from 'http';

export function getTestServer(): Server {
  return getKoaServer().getServer().listen(8080);
}

export async function connectDatabase(): Promise<DatabaseConnection> {
  const pool = getDatabaseConnection();
  await pool.connect();
  return pool;
}
