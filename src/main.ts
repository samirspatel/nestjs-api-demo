import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from 'common-sense-logger';
import { seedDatabase } from './database/seed';
import { DataSource } from 'typeorm';
import { getConnectionToken } from '@nestjs/typeorm';

const logger = new Logger({
  serviceName: 'nestjs-api-demo',
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false, // Disable default NestJS logger to use our custom logger
  });

  // Serve static files from public directory (works in both dev and prod)
  const publicPath = join(__dirname, '..', 'public');
  app.useStaticAssets(publicPath, {
    prefix: '/',
  });

  // Log application startup
  logger.info('[BOOTSTRAP] Starting Library Management API...');
  logger.debug('[BOOTSTRAP] Environment variables loaded', {
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
  logger.info('[BOOTSTRAP] Global validation pipes configured');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription(
      'A comprehensive API for managing a library system with books, authors, and borrowing operations',
    )
    .setVersion('1.0')
    .addTag('books', 'Book management endpoints')
    .addTag('authors', 'Author management endpoints')
    .addTag('borrowings', 'Book borrowing and return operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  logger.info('[BOOTSTRAP] Swagger documentation configured at /api');

  // Run seed on startup if enabled
  const shouldSeedOnStartup =
    process.env.SEED_ON_STARTUP === 'true' || process.env.NODE_ENV === 'development';
  if (shouldSeedOnStartup) {
    try {
      logger.info('[BOOTSTRAP] Running database seed on startup...');
      // Get the DataSource from NestJS TypeORM module
      // For TypeORM 0.3.x, we use getConnectionToken which returns DataSource
      const dataSource = app.get<DataSource>(getConnectionToken());
      await seedDatabase(dataSource);
      logger.info('[BOOTSTRAP] Database seed completed successfully');
    } catch (error) {
      logger.error('[BOOTSTRAP] Failed to seed database on startup', { error });
      // Don't exit - allow the app to start even if seeding fails
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.info(`[BOOTSTRAP] Application is running on: http://localhost:${port}`);
  logger.info(`[BOOTSTRAP] Swagger documentation available at: http://localhost:${port}/api`);
  logger.debug('[BOOTSTRAP] Application bootstrap completed successfully', {
    port,
    timestamp: new Date().toISOString(),
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
