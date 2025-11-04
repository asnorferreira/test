import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { EdgeConfigService } from './edge-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().default('development'),
        EDGE_DATABASE_URL: Joi.string().required(),
        EDGE_PORT: Joi.number().default(3001),
        EDGE_SYNC_BACKEND_URL: Joi.string().uri().required(),
        EDGE_API_KEY: Joi.string().required(),
        EDGE_SYNC_INTERVAL_MS: Joi.number().default(30000),
      }),
    }),
  ],
  providers: [EdgeConfigService],
  exports: [EdgeConfigService],
})
export class EdgeConfigModule {}