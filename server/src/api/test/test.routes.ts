import Router from 'koa-router';
import { debugSessionController } from '@api/test/test.controller';

const testRouter = new Router({ prefix: '/test' });

testRouter.get('/session', debugSessionController);

export default testRouter;
