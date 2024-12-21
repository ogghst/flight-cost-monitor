import {
    LogEntry,
    Logger,
    LoggerOptions,
    LogLevel,
    LogMetadata,
} from './types.js'

const LOG_LEVELS: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
}

export abstract class BaseLogger implements Logger {
    protected context?: string
    protected minLevel: LogLevel
    protected defaultMetadata: Record<string, unknown>

    constructor(options?: LoggerOptions) {
        this.context = options?.context
        this.minLevel = options?.minLevel ?? 'info'
        this.defaultMetadata = options?.metadata ?? {}
    }

    protected abstract writeLog(entry: LogEntry): void

    protected shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS[level] <= LOG_LEVELS[this.minLevel]
    }

    protected mergeMetadata(metadata?: LogMetadata): LogMetadata {
        return {
            ...this.defaultMetadata,
            ...(this.context ? { context: this.context } : {}),
            ...metadata,
        }
    }

    log(entry: LogEntry): void {
        if (this.shouldLog(entry.level)) {
            this.writeLog({
                ...entry,
                timestamp: entry.timestamp ?? new Date(),
                metadata: this.mergeMetadata(entry.metadata),
            })
        }
    }

    error(message: string, metadata?: LogMetadata): void {
        this.log({ level: 'error', message, metadata })
    }

    warn(message: string, metadata?: LogMetadata): void {
        this.log({ level: 'warn', message, metadata })
    }

    info(message: string, metadata?: LogMetadata): void {
        this.log({ level: 'info', message, metadata })
    }

    http(message: string, metadata?: LogMetadata): void {
        this.log({ level: 'http', message, metadata })
    }

    verbose(message: string, metadata?: LogMetadata): void {
        this.log({ level: 'verbose', message, metadata })
    }

    debug(message: string, metadata?: LogMetadata): void {
        this.log({ level: 'debug', message, metadata })
    }

    silly(message: string, metadata?: LogMetadata): void {
        this.log({ level: 'silly', message, metadata })
    }
}
