import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingsService } from './borrowings.service';
import { BorrowingsController } from './borrowings.controller';
import { BooksModule } from '../books/books.module';
import { LoggerModule } from '../common/logger/logger.module';
import { Borrowing } from './entities/borrowing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Borrowing]), BooksModule, LoggerModule],
  controllers: [BorrowingsController],
  providers: [BorrowingsService],
  exports: [BorrowingsService],
})
export class BorrowingsModule {}

