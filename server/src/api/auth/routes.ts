import Router from 'koa-router';
import { LocalPassport } from '@services/index';
import { isNotUserLogin, isUserLogin } from '@middlewares/auth';
import {
  createCredentialsController,
  loginController,
  sendSecurityCodeController,
  signInController,
  verifySecurityCodeController,
} from './controllers/business';

const authRouter = new Router({ prefix: '/auth' });

authRouter.post('/', signInController);
authRouter.post('/credentials', createCredentialsController);
authRouter.post('/sms', sendSecurityCodeController);
authRouter.post('/sms/verify', verifySecurityCodeController);
authRouter.post(
  '/login',
  isUserLogin,
  LocalPassport.authenticate(),
  loginController,
);
authRouter.post('/logout', isNotUserLogin, LocalPassport.logout());

export default authRouter;
