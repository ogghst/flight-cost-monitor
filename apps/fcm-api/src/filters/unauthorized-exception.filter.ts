import { FcmWinstonLogger } from '@fcm/shared/logging'
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  private readonly logger: FcmWinstonLogger

  constructor() {
    this.logger = FcmWinstonLogger.getInstance()
  }

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    // Get the error message and ensure it's a string
    const errorMessage = exception.message || 'Unauthorized'
    const message =
      typeof errorMessage === 'object'
        ? JSON.stringify(errorMessage)
        : String(errorMessage)

    // Log unauthorized attempt using FcmWinstonLogger
    this.logger.warn('Unauthorized Request', {
      path: `${request.method} ${request.url}`,
      ip: request.ip,
      headers: this.sanitizeHeaders(request.headers),
      query: request.query,
      body: this.sanitizeBody(request.body),
      error: message,
      timestamp: new Date().toISOString(),
    })

    response.status(401).json({
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Unauthorized access',
    })
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
}
