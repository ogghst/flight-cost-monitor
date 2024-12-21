// Update the imports in main.ts
import { AppModule } from '#/app.module.js'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { FcmWinstonLogger } from './logging/fcm-winston-logger.js'
import { formatError } from './utils/error.utils.js'

async function bootstrap() {
    // Create logger instance for bootstrapping
    const logger = new FcmWinstonLogger({
        context: 'Bootstrap',
        minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
    })

    try {
        logger.info('Starting application...')

        const app = await NestFactory.create(AppModule, {
            logger: logger,
        })

        app.useGlobalPipes(new ValidationPipe({ transform: true }))

        // Simplified Swagger setup for development
        const config = new DocumentBuilder()
            .setTitle('Flight Cost Monitor API')
            .setDescription('API for monitoring and searching flight costs')
            .setVersion('1.0')
            .addTag('Flight Offers')
            .addBearerAuth()
            .build()

        // Add more detailed error logging for Swagger document creation
        try {
            const document = SwaggerModule.createDocument(app, config)
            SwaggerModule.setup('api/docs', app, document)
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
