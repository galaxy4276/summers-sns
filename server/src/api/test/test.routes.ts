import Router from 'koa-router';
import { debugSessionController } from '@api/test/test.controller';
import { Session } from 'koa-session';

const testRouter = new Router({ prefix: '/test' });

testRouter.get('/session', debugSessionController);
testRouter.get('/session/views', (ctx) => {
  const session = <Session>ctx.session;
  const n = session.views || 0;
  session.views += n;
  ctx.body = {
    message: `${n} views`,
    n,
  };
});

export default testRouter;
