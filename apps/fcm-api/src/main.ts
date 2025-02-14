import { AppModule } from '@/app.module.js'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { UnauthorizedExceptionFilter } from './filters/unauthorized-exception.filter.js'
import { LoggingInterceptor } from './interceptors/logging.interceptor.js'
import { formatError } from './utils/error.utils.js'
import { NestLogger } from './utils/NestLogger.js'

async function bootstrap() {
  // Create logger instance for bootstrapping
  //const logger = FcmWinstonLogger.getInstance({
  //  context: 'fcm-api',
  //  logDirectory: '/logs',
  //  maxFiles: '2',
  //  maxSize: '100mb',
  //  minLevel: 'debug',
  //})

  const logger = NestLogger.getInstance({
    context: 'FCM-API',
  })

  try {
    logger.info('Starting application...')

    const app = await NestFactory.create(AppModule, {
      logger: logger,
      // This ensures we capture all requests, even before middleware
      bufferLogs: true,
    })

    // Register global interceptor - will log all requests
    app.useGlobalInterceptors(new LoggingInterceptor())

    // Register unauthorized exception filter
    app.useGlobalFilters(new UnauthorizedExceptionFilter())

    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    // Configure Swagger
    const config = new DocumentBuilder()
      .setTitle('Flight Cost Monitor API')
      .setDescription('API for monitoring and searching flight costs')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token'
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Flight Offers', 'Flight search and monitoring')
      .build()

    // Generate Swagger document with custom options
    try {
      const document = SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
        operationIdFactory: (controllerKey: string, methodKey: string) =>
          methodKey,
      })

      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tryItOutEnabled: true,
          displayRequestDuration: true,
        },
      })
      logger.debug('Swagger documentation generated successfully')
    } catch (error) {
      logger.error('Failed to generate Swagger documentation', {
        error: formatError(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }

    app.enableCors()

    const port = process.env.PORT || 3001
    await app.listen(port)

    logger.info('Application is running', {
      url: `http://localhost:${port}`,
      swagger: `http://localhost:${port}/api/docs`,
      nodeEnv: process.env.NODE_ENV || 'development',
    })
  } catch (error) {
    logger.error('Failed to start application', formatError(error))
    process.exit(1)
  }
}

bootstrap()
