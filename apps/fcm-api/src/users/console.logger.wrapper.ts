import { Logger, LogMetadata } from '@fcm/shared/logging'
import { ConsoleLogger } from '@nestjs/common'

export class ConsoleLoggerWrapper extends ConsoleLogger implements Logger {
  constructor() {
    super()
  }

  info(message: string, metadata?: LogMetadata) {
    super.log(message, metadata)
  }
  http(message: string, metadata?: LogMetadata) {
    super.log(message, metadata)
  }

  silly(message: string, metadata?: LogMetadata) {
    super.log(message, metadata)
  }
}
