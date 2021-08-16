import Router from 'koa-router';
import {
  createUserRoleController,
  sendSecurityCodeController,
  signInController,
} from './controller';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/role', createUserRoleController);
userRouter.post('/sms', sendSecurityCodeController);
userRouter.post('/', signInController);

export default userRouter;
