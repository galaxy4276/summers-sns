import { config } from 'dotenv';
import { Context } from 'koa';

class LocalPassPort {
  private readonly key: string;

  constructor() {
    config();
    this.key = process.env.SESSION_KEY as string;
  }

  authenticate() {
    return (ctx: Context) => {
      try {
        const { email, password } = ctx.request.body;
        console.log(email, password, this.key);
      } catch (err) {
        throw new Error(err);
      }
    };
  }
}

export default new LocalPassPort();
