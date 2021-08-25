import Router from 'koa-router';
import { LocalPassport } from '@services/index';
import { isNotUserLogin, isUserLogin } from '@middlewares/auth';
import {
  createCredentialsController,
  loginController,
  sendSecurityCodeController,
  signInController,
  verifySecurityCodeController,
} from './controller';

const userRouter = new Router({ prefix: '/user' });

userRouter.post('/', signInController);
userRouter.post('/credentials', createCredentialsController);
userRouter.post('/sms', sendSecurityCodeController);
userRouter.post('/sms/verify', verifySecurityCodeController);
userRouter.post(
  '/login',
  isUserLogin,
  LocalPassport.authenticate(),
  loginController,
);
userRouter.post('/logout', isNotUserLogin, LocalPassport.logout());

export { userRouter };
export default {};
