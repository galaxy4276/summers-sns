import Router from 'koa-router';
import { signInController } from './user.controller';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/', signInController);

export default userRouter;
