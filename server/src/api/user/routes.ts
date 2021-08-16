import Router from 'koa-router';
import { createUserRoleController, signInController } from './controller';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/role', createUserRoleController);
userRouter.post('/', signInController);

export default userRouter;
