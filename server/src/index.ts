import getKoaServer from '@config/application';
import { debug as log } from 'loglevel';
import { Context } from 'koa';

getKoaServer()
  .setLogger()
  .setParser()
  .setMiddleware((ctx: Context) => {
    log(ctx.body);
  })
  .setRouter()
  .run(() => {
    log(`listening on ${process.env.SERVER_PORT}...`);
  });
