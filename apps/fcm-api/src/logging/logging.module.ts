import { Global, Module } from '@nestjs/common';
import { FcmWinstonLogger } from './fcm-winston-logger.js';
import { LOGGER } from './logging.constants.js';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER,
      useFactory: () => {
        return new FcmWinstonLogger({
          minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
          context: 'FCM-API',
        });
      },
    },
  ],
  exports: [LOGGER],
})
export class LoggingModule {}
