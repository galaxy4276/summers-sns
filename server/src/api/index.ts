import Router from 'koa-router';
import testRouter from '@api/test/test.routes';
import { authRouter } from '@api/auth';

const rootRouter = new Router({ prefix: '/api' });

rootRouter.get('/', () => ({ test: true }));

rootRouter.use(authRouter.routes());
rootRouter.use(testRouter.routes());

export default rootRouter;
