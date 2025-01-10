import { BaseLogger, LogEntry, LoggerOptions } from '@fcm/shared'
import * as winston from 'winston'
import 'winston-daily-rotate-file'

export interface FcmWinstonLoggerOptions extends LoggerOptions {
  logDirectory?: string
  maxFiles?: string
  maxSize?: string
}

export class FcmWinstonLogger extends BaseLogger {
  private static instance: FcmWinstonLogger | undefined
  private logger!: winston.Logger

  private constructor(options?: FcmWinstonLoggerOptions) {
    super(options)
    this.initializeLogger(options)
  }

  public static getInstance(
    options?: FcmWinstonLoggerOptions
  ): FcmWinstonLogger {
    if (!FcmWinstonLogger.instance) {
      FcmWinstonLogger.instance = new FcmWinstonLogger(options)
    }
    return FcmWinstonLogger.instance
  }

  public static resetInstance(): void {
    FcmWinstonLogger.instance = undefined
  }

  public reconfigure(options: FcmWinstonLoggerOptions): void {
    this.initializeLogger(options)
  }

  private initializeLogger(options?: FcmWinstonLoggerOptions): void {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    )

    const logDir = options?.logDirectory ?? 'logs'
    const maxFiles = options?.maxFiles ?? '14d'
    const maxSize = options?.maxSize ?? '20m'

    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ context, level, timestamp, message, ms, ...meta }) => {
                const ctx = context ? `[${context}]` : ''
                const metaStr = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : ''
                return `${timestamp} ${level} ${ctx} ${message}${metaStr}`
              }
            )
          ),
        }),
        new winston.transports.DailyRotateFile({
          format: logFormat,
          filename: `${logDir}/combined-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize,
          maxFiles,
        }),
      ],
      levels: winston.config.npm.levels,
    })
  }

  protected writeLog(entry: LogEntry): void {
    const { level, message, metadata = {}, timestamp } = entry

    this.logger.log({
      level,
      message,
      timestamp,
      context: this.context,
      ...(Object.keys(metadata).length ? metadata : {}),
    })
  }
}
