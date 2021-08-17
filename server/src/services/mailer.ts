import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { config } from 'dotenv';

config();

interface Config {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export default {
  getConfig(): Config {
    return {
      host: process.env.EMAIL_HOST as string,
      port: process.env.EMAIL_PORT as unknown as number,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    };
  },
  async sendEmail(mail: SendMailOptions): Promise<any> {
    const transporter: Transporter = nodemailer.createTransport({
      ...this.getConfig(),
    });

    return transporter.sendMail(mail);
  },
};
