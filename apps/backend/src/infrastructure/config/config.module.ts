import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './validation.schema';
import { appConfig, dbConfig, oidcConfig, servicesConfig } from './configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validationSchema: validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      load: [appConfig, dbConfig, oidcConfig, servicesConfig],
    }),
  ],
})
export class ConfigAppModule {}