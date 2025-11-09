import { Module } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { BorrowingsController } from './borrowings.controller';
import { BooksModule } from '../books/books.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [BooksModule, LoggerModule],
  controllers: [BorrowingsController],
  providers: [BorrowingsService],
  exports: [BorrowingsService],
})
export class BorrowingsModule {}

