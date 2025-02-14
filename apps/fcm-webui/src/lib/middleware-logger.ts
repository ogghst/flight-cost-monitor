// A specialized logger for middleware operations that ensures visibility in both server and client environments
class MiddlewareLogger {
  private prefix = '[Middleware]'

  // Use console.log instead of debug to ensure visibility
  log(message: string, data?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const logMessage = `${this.prefix} ${timestamp} - ${message}`

    if (data) {
      console.log(logMessage, data)
    } else {
      console.log(logMessage)
    }
  }

  error(message: string, data?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const errorMessage = `${this.prefix} ERROR ${timestamp} - ${message}`

    if (data) {
      console.error(errorMessage, data)
    } else {
      console.error(errorMessage)
    }
  }

  logRequest(request: Request) {
    this.log('Incoming request', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    })
  }

  logResponse(response: Response, details?: Record<string, unknown>) {
    this.log('Outgoing response', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      ...details,
    })
  }

  logToken(token: unknown, source: string) {
    this.log('Token information', {
      source,
      token,
      timestamp: new Date().toISOString(),
    })
  }

  logCORS(origin: string, credentials: boolean) {
    this.log('CORS configuration', {
      origin,
      credentials,
      timestamp: new Date().toISOString(),
    })
  }

  logCookies(cookies: Record<string, string>) {
    this.log('Cookie state', { cookies })
  }
}

// Export a singleton instance
export const middlewareLogger = new MiddlewareLogger()
