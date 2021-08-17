import { config } from 'dotenv';
import client from 'twilio';

config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

export default {
  twilioPhone,
  client: client(accountSid, authToken),
};
