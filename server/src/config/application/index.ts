import Koa, { DefaultState, DefaultContext, Context } from 'koa';
import { join } from 'path';
import { setLevel as setLogLevel } from 'loglevel';
import koaBody from 'koa-body';
import morgan from 'koa-morgan';
import Router from 'koa-router';
import { config as loadEnvVariables } from 'dotenv';
import Joi from 'joi';
import { SystemVariables } from '@typings/system';
import { ConnectionConfig } from 'mariadb';
import { Document, loadDocumentSync } from 'swagger2';
import { ui } from 'swagger2-koa';
import rootRouter from '@api/index';

type NumberVariables = number | undefined;

/**
 * @desc Koa 서버 인스턴스를 서버 설정 또는 미들웨어를 부착하는 메서드와 함께 반환
 */
class KoaServer {
  private readonly app: Koa<DefaultState, DefaultContext>;
  private router: Router;
  private readonly isDevelopment: boolean;
  private readonly systemVariables: SystemVariables;
  private readonly swaggerDocument: Document;

  constructor() {
    this.swaggerDocument = this.getInitSwaggerDocumentation();
    this.systemVariables = this.getInitValidationSystemVariable();
    this.app = new Koa();
    this.router = rootRouter;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    setLogLevel(this.isDevelopment ? 'DEBUG' : 'ERROR');
  }

  getSystemVariables(): SystemVariables {
    return this.systemVariables;
  }

  setSwaggerUi(): this {
    if (this.systemVariables.mode === 'development') {
      this.app.use(ui(this.swaggerDocument, '/swagger'));
    }
    return this;
  }

  getDatabaseVariables(): ConnectionConfig {
    return {
      host: this.systemVariables.dbHost,
      user: this.systemVariables.dbUser,
      password: this.systemVariables.dbPassword,
      port: this.systemVariables.dbPort,
    };
  }

  setRouter(): this {
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
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

  getInitValidationSystemVariable(): SystemVariables {
    loadEnvVariables();
    const schema = Joi.object<SystemVariables>({
      mode: Joi.string().required(),
      serverPort: Joi.number().required(),
      dbPort: Joi.number().required(),
      dbHost: Joi.string().required(),
      dbName: Joi.string().required(),
      dbPassword: Joi.string().required(),
      dbUser: Joi.string().required(),
    });
    const systemValues: Partial<SystemVariables> = {
      mode: process.env.NODE_ENV,
      serverPort: process.env.SERVER_PORT as NumberVariables,
      dbPort: process.env.DB_PORT as NumberVariables,
      dbHost: process.env.DB_HOST,
      dbPassword: process.env.DB_PASSWORD,
      dbName: process.env.DB_NAME,
      dbUser: process.env.DB_USER,
    };

    const { value, error } = schema.validate(systemValues);

    if (error) {
      throw Error(`💥 cannot read system variables 💥 \n${error}`);
    }
    return value as SystemVariables;
  }

  getInitSwaggerDocumentation(): Document {
    const document = loadDocumentSync(
      join(__dirname, '..', '..', '..', 'api.yaml'),
    );
    return document as Document;
  }
}

/**
 * @desc KoaServer 인스턴스의 Factory Function
 */
export default function getKoaServer(): KoaServer {
  return new KoaServer();
}
