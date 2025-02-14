import { ConsoleLogger } from '@nestjs/common'
import { Logger, LogEntry, LogMetadata, LoggerOptions } from '@fcm/shared'

export class NestLogger implements Logger {
  private readonly logger: ConsoleLogger
  private static instance: NestLogger | null = null

  private constructor(options?: LoggerOptions) {
    this.logger = new ConsoleLogger(options?.context)
  }

  public static getInstance(options?: LoggerOptions): NestLogger {
    if (!NestLogger.instance) {
      NestLogger.instance = new NestLogger(options)
    }
    return NestLogger.instance
  }

  error(message: string, metadata?: LogMetadata): void {
    this.logger.error(message, this.formatMetadata(metadata))
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.logger.warn(message, this.formatMetadata(metadata))
  }

  info(message: string, metadata?: LogMetadata): void {
    this.logger.log(message, this.formatMetadata(metadata))
  }

  http(message: string, metadata?: LogMetadata): void {
    this.logger.verbose(message, this.formatMetadata(metadata))
  }

  verbose(message: string, metadata?: LogMetadata): void {
    this.logger.verbose(message, this.formatMetadata(metadata))
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.logger.debug(message, this.formatMetadata(metadata))
  }

  silly(message: string, metadata?: LogMetadata): void {
    this.logger.verbose(message, this.formatMetadata(metadata))
  }

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

  private formatMetadata(metadata?: LogMetadata): string | undefined {
    if (!metadata) return undefined

    const { context, ...rest } = metadata
    if (Object.keys(rest).length === 0) return context

    return `${context ? `[${context}] ` : ''}${JSON.stringify(rest)}`
  }
}
