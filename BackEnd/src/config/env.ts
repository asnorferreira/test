import 'dotenv/config';

const required = (key: string) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:3000',
  SIGNUP_URL: process.env.SIGNUP_URL || 'http://localhost:3000/signup',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
};
