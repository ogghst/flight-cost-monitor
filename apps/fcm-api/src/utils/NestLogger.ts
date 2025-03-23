import { LogMetadata, Logger } from '@fcm/shared'
import { ConsoleLogger } from '@nestjs/common'

export class NestLogger extends ConsoleLogger implements Logger {
  //private readonly logger: ConsoleLogger
  //private static instance: NestLogger | null = null

  constructor(options?: any) {
    super(options)
  }

  /*public static getInstance(options?: any): NestLogger {
    if (!NestLogger.instance) {
      NestLogger.instance = new NestLogger(options)
    }
    return NestLogger.instance
  }
    */

  info(message: string, metadata?: any): void {
    super.log(message, metadata)
  }
  http(message: string, metadata?: any): void {
    super.log(message, metadata)
  }
  silly(message: string, metadata?: any): void {
    super.log(message, metadata)
  }

  error(message: string, metadata?: any): void {
    super.log(message, metadata)
  }

  warn(message: string, metadata?: any): void {
    super.log(message, metadata)
  }

  verbose(message: string, metadata?: any): void {
    super.log(message, metadata)
  }

  debug(message: string, metadata?: any): void {
    super.log(message, metadata)
  }

  /*
  log(entry: LogEntry): void {
    switch (entry.level) {
      case 'error':
        this.error(entry.message, entry.metadata)
        break
      case 'warn':
        this.warn(entry.message, entry.metadata)
        break
      case 'info':
        this.info(entry.message, entry.metadata)
        break
      case 'http':
        this.http(entry.message, entry.metadata)
        break
      case 'verbose':
        this.verbose(entry.message, entry.metadata)
        break
      case 'debug':
        this.debug(entry.message, entry.metadata)
        break
      case 'silly':
        this.silly(entry.message, entry.metadata)
        break
    }
  }
    */

  private formatMetadata(metadata?: LogMetadata): string | undefined {
    if (!metadata) return undefined

    const { context, ...rest } = metadata
    if (Object.keys(rest).length === 0) return context

    return `${context ? `[${context}] ` : ''}${JSON.stringify(rest)}`
  }
}
