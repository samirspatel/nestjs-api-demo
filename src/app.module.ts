import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { BorrowingsModule } from './borrowings/borrowings.module';
import { LoggerModule } from './common/logger/logger.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppController } from './app.controller';
import { Book } from './books/entities/book.entity';
import { Author } from './authors/entities/author.entity';
import { Borrowing } from './borrowings/entities/borrowing.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'library_user',
      password: process.env.DATABASE_PASSWORD || 'library_password',
      database: process.env.DATABASE_NAME || 'library_db',
      entities: [Book, Author, Borrowing],
      synchronize: true, // Auto-sync schema (set to false in production with migrations)
      logging: process.env.NODE_ENV === 'development',
    }),
    LoggerModule,
    BooksModule,
    AuthorsModule,
    BorrowingsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Global logging interceptor is applied via APP_INTERCEPTOR
  }
}

