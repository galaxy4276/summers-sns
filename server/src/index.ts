import getKoaServer from '@config/application';
import { debug as log } from 'loglevel';
import conn from '@config/database';

const runMethodCallback = () =>
  log(`listening on ${process.env.SERVER_PORT}...`);

async function main(): Promise<void> {
  const koa = getKoaServer();
  await conn.connect().then(() => log('Database Connected'));
  await conn.initialize();
  koa.run(runMethodCallback);
}

main();
