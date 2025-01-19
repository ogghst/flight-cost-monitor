import { LogEntry, Logger, LogMetadata } from '../types.js'

export class ConsoleLogger implements Logger {
    private context?: string

    constructor(context?: string) {
        this.context = context
    }

    http(message: string, metadata?: LogMetadata): void {
        console.info(this.formatMessage(message, metadata))
    }

    verbose(message: string, metadata?: LogMetadata): void {
        console.info(this.formatMessage(message, metadata))
    }

    silly(message: string, metadata?: LogMetadata): void {
        console.info(this.formatMessage(message, metadata))
    }

    log(entry: LogEntry): void {
        console.info(this.formatMessage(entry.message, entry.metadata))
    }

    private formatMessage(
        message: string,
        metadata?: Record<string, unknown>
    ): string {
        const timestamp = new Date().toISOString()
        const contextStr = this.context ? ` [${this.context}]` : ''
        const metadataStr = metadata
            ? `\n${JSON.stringify(metadata, null, 2)}`
            : ''

        return `${timestamp}${contextStr} ${message}${metadataStr}`
    }

    debug(message: string, metadata?: Record<string, unknown>): void {
        console.debug(this.formatMessage(message, metadata))
    }

    info(message: string, metadata?: Record<string, unknown>): void {
        console.info(this.formatMessage(message, metadata))
    }

    warn(message: string, metadata?: Record<string, unknown>): void {
        console.warn(this.formatMessage(message, metadata))
    }

    error(message: string, metadata?: Record<string, unknown>): void {
        console.error(this.formatMessage(message, metadata))
    }

    setContext(context: string): void {
        this.context = context
    }

    child(context: string): Logger {
        return new ConsoleLogger(context)
    }
}
