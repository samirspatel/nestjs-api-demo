import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { LoggerModule } from '../common/logger/logger.module';
import { Author } from './entities/author.entity';
import { Book } from '../books/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Book]), LoggerModule],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}

