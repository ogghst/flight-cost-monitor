import { utilities as nestWinstonModuleUtilities } from 'nest-winston'
import * as winston from 'winston'
import 'winston-daily-rotate-file'

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('@fcm/api', {
        prettyPrint: true,
        colors: true,
    })
)

export const loggingConfig = {
    transports: [
        // Console logging for development
        new winston.transports.Console({
            format: logFormat,
        }),
        // Rotating file for errors
        new winston.transports.DailyRotateFile({
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            ),
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'error',
        }),
        // Rotating file for all logs
        new winston.transports.DailyRotateFile({
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            ),
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
    // Custom log levels (optional)
    levels: winston.config.npm.levels,
}
