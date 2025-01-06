import { FcmWinstonLogger } from '@fcm/shared/logging'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: FcmWinstonLogger

  constructor() {
    this.logger = FcmWinstonLogger.getInstance()
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const startTime = Date.now()
    const { method, originalUrl, body, query, headers } = request

    // Log request
    this.logger.debug('Incoming Request', {
      method,
      url: originalUrl,
      headers: this.sanitizeHeaders(headers),
      query,
      body: this.sanitizeBody(body),
    })

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const duration = Date.now() - startTime
          // Log response
          this.logger.debug('Response Sent', {
            method,
            url: originalUrl,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            body: this.sanitizeResponse(data),
          })
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime
          // Log error
          this.logger.error('Request Error', {
            method,
            url: originalUrl,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
          })
        },
      })
    )
  }

  private sanitizeHeaders(
    headers: Record<string, unknown>
  ): Record<string, unknown> {
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie']
    return Object.keys(headers).reduce(
      (acc, key) => {
        if (sensitiveHeaders.includes(key.toLowerCase())) {
          acc[key] = '[REDACTED]'
        } else {
          acc[key] = headers[key]
        }
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  private sanitizeBody(body: any): any {
    if (!body) return body
    const sanitized = { ...body }
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret']

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }
    return sanitized
  }

  private sanitizeResponse(data: any): any {
    if (!data) return data
    const sanitized = { ...data }
    const sensitiveFields = ['accessToken', 'refreshToken', 'password']

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }
    return sanitized
  }
}
