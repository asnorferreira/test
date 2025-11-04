import { utilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-transport';

export class NestWinstonFactory {
  static (appName: string): winston.Logger {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const logLevel = process.env.OTEL_LOG_LEVEL || 'info';

    const transports: winston.transport[] = [];

    if (nodeEnv === 'production') {
      transports.push(
        new winston.transports.Console({
          level: logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json(),
          ),
        }),
      );
    } else {
      transports.push(
        new winston.transports.Console({
          level: logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike(appName, {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
      );
    }

    return winston.createLogger({
      transports,
    });
  }
}