import * as winston from 'winston';
import 'winston-daily-rotate-file';
const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.ms());
export const loggingConfig = {
    transports: [
        new winston.transports.Console({
            format: logFormat,
        }),
        new winston.transports.DailyRotateFile({
            format: winston.format.combine(winston.format.uncolorize(), logFormat),
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'error',
        }),
        new winston.transports.DailyRotateFile({
            format: winston.format.combine(winston.format.uncolorize(), logFormat),
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
    levels: winston.config.npm.levels,
};
//# sourceMappingURL=logging.config.js.map