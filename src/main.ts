import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable default NestJS logger to use our custom logger
  });

  const logger = app.get(LoggerService);

  // Log application startup
  logger.info('Starting Library Management API...', 'BOOTSTRAP');
  logger.debug('Environment variables loaded', 'BOOTSTRAP', {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  logger.info('Global validation pipes configured', 'BOOTSTRAP');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription('A comprehensive API for managing a library system with books, authors, and borrowing operations')
    .setVersion('1.0')
    .addTag('books', 'Book management endpoints')
    .addTag('authors', 'Author management endpoints')
    .addTag('borrowings', 'Book borrowing and return operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  logger.info('Swagger documentation configured at /api', 'BOOTSTRAP');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.info(
    `Application is running on: http://localhost:${port}`,
    'BOOTSTRAP',
  );
  logger.info(
    `Swagger documentation available at: http://localhost:${port}/api`,
    'BOOTSTRAP',
  );
  logger.verbose('Application bootstrap completed successfully', 'BOOTSTRAP', {
    port,
    timestamp: new Date().toISOString(),
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

