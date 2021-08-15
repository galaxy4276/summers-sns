import {
  getKoaServer,
  getDatabaseConnection,
  DatabaseConnection,
} from '@config/index';
import { Server } from 'http';

/**
 * @desc 테스트용 서버와 데이터베이스 인스턴스를 초기화 후, 반환합니다.
 */
export default async function getTestServer(): Promise<
  [Server, DatabaseConnection]
> {
  const testServer = getKoaServer()
    .setParser()
    .setAuthMiddlewares()
    .setRouter();
  const pool = getDatabaseConnection();
  return [testServer.getServer().listen(8081), pool];
}
