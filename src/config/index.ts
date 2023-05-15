import { config, DotenvConfigOptions } from 'dotenv';
const options: DotenvConfigOptions = {
  path: `.env.${process.env.NODE_ENV || 'development'}.local`,
};
config();

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  CLIENT_URL,
  API_BASE,
  API_SECURE_BASE,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  ORIGIN,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_EMAIL_FROM,
  SMTP_PORT,
  REDIS_HOST,
  REDIS_PORT,
} = process.env;
