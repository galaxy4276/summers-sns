import { debug as log } from 'loglevel';
import { Context } from 'koa';
import { getKoaServer } from '@config/index';
import conn from '@config/database';

const errorCb = (err: Error, ctx: Context): void => {
  log(`statusCode::${ctx.status}`);
  log(`name:: ${err.name}`);
  log(`message:: ${err.message}`);
};

async function main(): Promise<void> {
  const koa = getKoaServer()
    .setSwaggerUi()
    .setLogger()
    .setParser()
    .setAuthMiddlewares()
    .setRouter()
    .setErrorHandler(errorCb);
  await conn.initialize();
  koa.run(() => log(`listening on ${process.env.SERVER_PORT}...`));
}

main();
