import { BaseLogger, LogEntry, LoggerOptions } from '@fcm/shared';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export class FcmWinstonLogger extends BaseLogger {
  private logger: winston.Logger;

  constructor(
    options?: LoggerOptions & {
      logDirectory?: string;
      maxFiles?: string;
      maxSize?: string;
    },
  ) {
    super(options);

    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      //winston.format.errors({ stack: true }), // Add this line
      //winston.format.splat(),                 // Add this line
      //winston.format.json(),                  // Add this line
      //nestWinstonModuleUtilities.format.nestLike('FCM-API', {
      //  prettyPrint: true,
      //  colors: true,
      //}),
    );

    const logDir = options?.logDirectory ?? 'logs';
    const maxFiles = options?.maxFiles ?? '14d';
    const maxSize = options?.maxSize ?? '20m';

    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ context, level, timestamp, message, ms, ...meta }) => {
                const metaString = Object.keys(meta).length
                  ? `\n${JSON.stringify(meta, null, 2)}`
                  : '';
                return `${timestamp} ${level} [${context}] ${message}${ms}${metaString}`;
              },
            ),
          ),
        }),
        new winston.transports.DailyRotateFile({
          format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json(),
          ),
          filename: `${logDir}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize,
          maxFiles,
          level: 'error',
        }),
        new winston.transports.DailyRotateFile({
          format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json(),
          ),
          filename: `${logDir}/combined-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize,
          maxFiles,
        }),
      ],
      levels: winston.config.npm.levels,
    });
  }

  protected writeLog(entry: LogEntry): void {
    const metadata = { ...entry.metadata };

    if (metadata?.error) {
      // Type check and format the error object
      const errorObj = metadata.error;
      if (errorObj instanceof Error) {
        metadata.error = {
          message: errorObj.message,
          name: errorObj.name,
          stack: errorObj.stack,
        };
      } else if (typeof errorObj === 'object' && errorObj !== null) {
        metadata.error = errorObj;
      } else {
        metadata.error = { message: String(errorObj) };
      }
    }

    this.logger.log({
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      context: this.context,
      ...metadata,
    });
  }
}
