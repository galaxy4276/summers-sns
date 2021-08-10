import Koa, { DefaultState, DefaultContext, Context } from 'koa';
import { setLevel as setLogLevel } from 'loglevel';
import koaBody from 'koa-body';
import morgan from 'koa-morgan';
import Router from 'koa-router';
import { config as loadEnvVariables } from 'dotenv';

/**
 * @desc Koa 서버 인스턴스를 서버 설정 또는 미들웨어를 부착하는 메서드와 함께 반환
 */
class KoaServer {
  private app: Koa<DefaultState, DefaultContext>;

  private router: Router;

  private readonly isDevelopment: boolean;

  constructor() {
    loadEnvVariables();
    this.app = new Koa();
    this.router = new Router();
    this.isDevelopment = process.env.NODE_ENV === 'development';
    setLogLevel(this.isDevelopment ? 'DEBUG' : 'ERROR');
  }

  setRouter(): this {
    this.app.use(this.router.routes());
    this.router.prefix('/api');
    return this;
  }

  setLogger(): this {
    this.app.use(morgan(this.isDevelopment ? 'dev' : 'common'));
    return this;
  }

  setParser(): this {
    this.app.use(koaBody());
    return this;
  }

  setMiddleware(callback: (ctx: Context) => void): this {
    this.app.use(callback);
    return this;
  }

  setErrorHandler(handler: (err: Error, ctx: Context) => void): this {
    this.app.on('error', handler);
    return this;
  }

  getServer(): Koa {
    return this.app;
  }

  run(runCb?: () => void): void {
    const port = process.env.SERVER_PORT;
    if (!port) {
      throw Error('💥 Cannot read server port env variable. 💥');
    }
    this.app.listen(port, runCb);
  }
}

/**
 * @desc KoaServer 인스턴스의 Factory Function
 */
export default function getKoaServer(): KoaServer {
  return new KoaServer();
}
