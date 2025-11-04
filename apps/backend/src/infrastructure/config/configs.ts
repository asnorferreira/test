import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  appName: process.env.APP_NAME,
  tz: process.env.TZ,
}));

export const dbConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const oidcConfig = registerAs('oidc', () => ({
  issuerUrl: process.env.OIDC_ISSUER_URL,
  audience: process.env.OIDC_AUDIENCE,
}));

export const servicesConfig = registerAs('services', () => ({
  messageBus: {
    url: process.env.MESSAGE_BUS_URL,
    exchange: process.env.MESSAGE_BUS_EXCHANGE,
    topics: {
      accessEvents: process.env.TOPIC_ACCESS_EVENTS,
      deviceCommands: process.env.TOPIC_DEVICE_COMMANDS,
      edgeSync: process.env.TOPIC_EDGE_SYNC,
      auditTrail: process.env.TOPIC_AUDIT_TRAIL,
    },
  },
  storage: {
    endpoint: process.env.STORAGE_S3_ENDPOINT,
    bucket: process.env.STORAGE_S3_BUCKET,
    accessKey: process.env.STORAGE_S3_ACCESS_KEY,
    secretKey: process.env.STORAGE_S3_SECRET_KEY,
    region: process.env.STORAGE_S3_REGION,
    presignedUrlExpiresIn: parseInt(
      process.env.STORAGE_S3_PRESIGNED_URL_EXPIRES_IN_SECONDS || '3600',
      10,
    ),
  },
  otel: {
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    serviceName: process.env.OTEL_SERVICE_NAME,
    logLevel: process.env.OTEL_LOG_LEVEL,
  },
  licenseServer: {
    url: process.env.LICENSE_SERVER_URL,
    apiKey: process.env.LICENSE_SERVER_API_KEY,
  },
}));