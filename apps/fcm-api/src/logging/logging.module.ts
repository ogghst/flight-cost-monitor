import { FcmWinstonLogger } from '@fcm/shared/logging/winston'
import { Global, Module } from '@nestjs/common'
import { LOGGER } from './logging.constants.js'

@Global()
@Module({
  providers: [
    {
      provide: LOGGER,
      useFactory: () => {
        return FcmWinstonLogger.getInstance()
      },
    },
  ],
  exports: [LOGGER],
})
export class LoggingModule {}
