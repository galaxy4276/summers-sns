import Router from 'koa-router';
import {
  createCredentialsController,
  sendSecurityCodeController,
  signInController,
  verifySecurityCodeController,
} from './controller';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/credentials', createCredentialsController);
userRouter.post('/sms', sendSecurityCodeController);
userRouter.post('/sms/verify', verifySecurityCodeController);
userRouter.post('/', signInController);

export default userRouter;
