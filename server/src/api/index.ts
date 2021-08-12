import Router from 'koa-router';
import userRouter from '@api/user/user.routes';

const rootRouter = new Router({ prefix: '/api' });

rootRouter.get('/', () => ({ test: true }));

rootRouter.use(userRouter.routes());

export default rootRouter;
