import Router from 'koa-router';
import { LocalPassport } from '@services/index';
import { isUserLogin } from '@middlewares/auth';
import {
  createCredentialsController,
  loginController,
  sendSecurityCodeController,
  signInController,
  verifySecurityCodeController,
} from './controller';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/credentials', createCredentialsController);
userRouter.post('/sms', sendSecurityCodeController);
userRouter.post('/sms/verify', verifySecurityCodeController);
userRouter.post('/', signInController);
userRouter.post(
  '/login',
  isUserLogin,
  LocalPassport.authenticate(),
  loginController,
);

export { userRouter };
export default {};
