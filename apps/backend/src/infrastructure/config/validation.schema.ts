import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Aplicação
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().required(),
  TZ: Joi.string().default('America/Sao_Paulo'),

  // Database
  DATABASE_URL: Joi.string().uri().required(),

  // Segurança (OIDC)
  OIDC_ISSUER_URL: Joi.string().uri().required(),
  OIDC_AUDIENCE: Joi.string().required(),

  // Mensageria (AMQP)
  MESSAGE_BUS_URL: Joi.string().uri().required(),
  MESSAGE_BUS_EXCHANGE: Joi.string().required(),
  TOPIC_ACCESS_EVENTS: Joi.string().required(),
  TOPIC_DEVICE_COMMANDS: Joi.string().required(),
  TOPIC_EDGE_SYNC: Joi.string().required(),
  TOPIC_AUDIT_TRAIL: Joi.string().required(),

  // Storage (S3)
  STORAGE_S3_ENDPOINT: Joi.string().uri().required(),
  STORAGE_S3_BUCKET: Joi.string().required(),
  STORAGE_S3_ACCESS_KEY: Joi.string().required(),
  STORAGE_S3_SECRET_KEY: Joi.string().required(),
  STORAGE_S3_REGION: Joi.string().default('us-east-1'),
  STORAGE_S3_PRESIGNED_URL_EXPIRES_IN_SECONDS: Joi.number().default(3600),

  // Observabilidade (OTel)
  OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string().uri().required(),
  OTEL_SERVICE_NAME: Joi.string().required(),
  OTEL_LOG_LEVEL: Joi.string().default('info'),

  // Serviços Externos
  LICENSE_SERVER_URL: Joi.string().uri().required(),
  LICENSE_SERVER_API_KEY: Joi.string().required(),
});