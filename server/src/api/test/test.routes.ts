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
testRouter.get('/session/init', (ctx) => {
  ctx.session = null;
  ctx.body = {
    message: '세션을 초기화하였습니다.',
  };
});

export default testRouter;
