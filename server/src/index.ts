import getKoaServer from '@config/application';
import { debug as log } from 'loglevel';
import conn from '@config/database';

async function main(): Promise<void> {
  const koa = getKoaServer();
  await conn.connect().then(() => log('Database Connected'));
  await conn.initialize();
  koa.run(() => log(`listening on ${process.env.SERVER_PORT}...`));
}

main();
