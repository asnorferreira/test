import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        // 1. App
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        API_PORT: Joi.number().default(3333),
        API_GLOBAL_PREFIX: Joi.string().default('api/v1'),
        
        // 2. Database
        DATABASE_URL: Joi.string().required(),
        
        // 3. Auth
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.string().required(),

        // 4. Supabase
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_SERVICE_KEY: Joi.string().required(),
        SUPABASE_CV_BUCKET: Joi.string().required(),

        // 5. Mailgun
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().email().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class CoreConfigModule {}