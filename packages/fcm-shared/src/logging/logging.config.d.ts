import * as winston from 'winston';
import 'winston-daily-rotate-file';
export declare const loggingConfig: {
    transports: (winston.transports.ConsoleTransportInstance | import("winston-daily-rotate-file"))[];
    levels: winston.config.NpmConfigSetLevels;
};
