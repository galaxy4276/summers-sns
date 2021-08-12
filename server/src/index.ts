import { debug as log } from 'loglevel';
import { Context } from 'koa';
import { getKoaServer, databaseConnection } from '@config/index';

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
    .setRouter()
    .setErrorHandler(errorCb);
  await databaseConnection
    .connect(koa.getDatabaseVariables())
    .then(() => log('Database Connected'));
  await databaseConnection.initialize();
  koa.run(() => log(`listening on ${process.env.SERVER_PORT}...`));
}

main();
