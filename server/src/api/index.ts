import Router from 'koa-router';
import { userRouter } from '@api/user';
import testRouter from '@api/test/test.routes';

const rootRouter = new Router({ prefix: '/api' });

rootRouter.get('/', () => ({ test: true }));

rootRouter.use(userRouter.routes());
rootRouter.use(testRouter.routes());

export default rootRouter;
