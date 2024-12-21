export type LogLevel =
    | 'error'
    | 'warn'
    | 'info'
    | 'http'
    | 'verbose'
    | 'debug'
    | 'silly'

export interface LogMetadata {
    context?: string
    [key: string]: unknown
}

export interface LogEntry {
    level: LogLevel
    message: string
    timestamp?: string | Date
    metadata?: LogMetadata
}

export interface Logger {
    error(message: string, metadata?: LogMetadata): void
    warn(message: string, metadata?: LogMetadata): void
    info(message: string, metadata?: LogMetadata): void
    http(message: string, metadata?: LogMetadata): void
    verbose(message: string, metadata?: LogMetadata): void
    debug(message: string, metadata?: LogMetadata): void
    silly(message: string, metadata?: LogMetadata): void
    log(entry: LogEntry): void
}

export interface LoggerOptions {
    context?: string
    minLevel?: LogLevel
    metadata?: Record<string, unknown>
}
