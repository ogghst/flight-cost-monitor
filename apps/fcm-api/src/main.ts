import { AppModule } from '@/app.module.js'
import { patchNestjsSwagger } from '@anatine/zod-nestjs'
import { FcmWinstonLogger } from '@fcm/shared/logging/winston'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { UnauthorizedExceptionFilter } from './filters/unauthorized-exception.filter.js'
import { LoggingInterceptor } from './interceptors/logging.interceptor.js'
import { formatError } from './utils/error.utils.js'

async function bootstrap() {
  // Create logger instance for bootstrapping
  const logger = FcmWinstonLogger.getInstance({
    context: 'fcm-api',
    logDirectory: '/logs',
    maxFiles: '2',
    maxSize: '100mb',
    minLevel: 'debug',
  })

  try {
    const app = await NestFactory.create(AppModule, {
      logger: logger,
      bufferLogs: true,
      abortOnError: false,
    })

    // Patch Swagger to work with Zod schemas
    patchNestjsSwagger()

    // Use WebSocket adapter explicitly
    app.useWebSocketAdapter(new IoAdapter(app))

    // Register global interceptor - will log all requests
    app.useGlobalInterceptors(new LoggingInterceptor())

    // Register unauthorized exception filter
    app.useGlobalFilters(new UnauthorizedExceptionFilter())

    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    // Configure Swagger
    const config = new DocumentBuilder()
      .setTitle('Flight Cost Monitor API')
      .setDescription('API Documentation for Flight Cost Monitor')
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
      // Define tags for better organization
      .addTag('Auth', 'Authentication endpoints')
      .addTag('OAuth', 'OAuth authentication endpoints')
      .addTag('Flight Offers', 'Flight search and monitoring')
      .addTag('Scheduler', 'Task scheduling endpoints')
      .addTag('Monitoring', 'Monitoring and metrics endpoints')
      .build()

    // Generate Swagger document with custom options
    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      extraModels: [], // Add your DTOs here if needed
      ignoreGlobalPrefix: false,
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    })

    SwaggerModule.setup('api/docs', app, document, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        filter: true,
        deepLinking: true,
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        docExpansion: 'none',
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customCssUrl: '/swagger-custom.css', // Optional: Add custom styling
      customfavIcon: '/favicon.ico',
      customSiteTitle: 'FCM API Documentation',
    })

    // Configure CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })

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

// Add error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

bootstrap().catch((err) => {
  console.error('Unhandled bootstrap error:', err)
  process.exit(1)
})
