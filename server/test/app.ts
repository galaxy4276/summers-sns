import { getKoaServer } from '@config/index';
import { Server } from 'http';

/**
 * @desc 테스트용 서버와 데이터베이스 인스턴스를 초기화 후, 반환합니다.
 */
export default async function getTestServer(): Promise<Server> {
  const testServer = getKoaServer()
    .setParser()
    .setAuthMiddlewares()
    .setRouter();
  return testServer.getServer().listen(8088);
}
