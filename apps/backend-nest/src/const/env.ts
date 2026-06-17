import * as dotenv from 'dotenv';

dotenv.config();

type BOFANS_WEAPP_PUBLISH_STATUS_TYPE = 'normal' | 'in_review';
const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'test') {
      return `test-${key.toLowerCase()}`;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: {
  JWT_SECRET: string;
  APP_ID: string;
  APP_SECRET: string;
  OSS_RS_UPLOAD_TOKEN: string;
  PHOTO_OSS_HOST: string;
  BOFANS_WEAPP_PUBLISH_STATUS: BOFANS_WEAPP_PUBLISH_STATUS_TYPE;
  ADMIN_ACCOUNT: string;
  ADMIN_PASSWORD_SHA256: string;
  ADMIN_COOKIE_SECURE: boolean;
  CORS_ORIGINS: string[];
  MAX_UPLOAD_BYTES: number;
} = {
  JWT_SECRET: required('JWT_SECRET'),
  APP_ID: required('APP_ID'),
  APP_SECRET: required('APP_SECRET'),
  OSS_RS_UPLOAD_TOKEN: required('OSS_RS_UPLOAD_TOKEN'),
  PHOTO_OSS_HOST: process.env.PHOTO_OSS_HOST || 'https://yuanbo.online',
  BOFANS_WEAPP_PUBLISH_STATUS:
    (process.env
      .BOFANS_WEAPP_PUBLISH_STATUS as BOFANS_WEAPP_PUBLISH_STATUS_TYPE) ||
    'normal',
  ADMIN_ACCOUNT: required('ADMIN_ACCOUNT'),
  ADMIN_PASSWORD_SHA256: required('ADMIN_PASSWORD_SHA256'),
  ADMIN_COOKIE_SECURE: process.env.ADMIN_COOKIE_SECURE === 'true',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  MAX_UPLOAD_BYTES: Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024),
};
