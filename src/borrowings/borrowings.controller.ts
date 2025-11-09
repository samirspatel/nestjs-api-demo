import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { BorrowingResponseDto } from './dto/borrowing-response.dto';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('borrowings')
@Controller('borrowings')
export class BorrowingsController {
  constructor(
    private readonly borrowingsService: BorrowingsService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('BorrowingsController initialized', 'BORROWINGS_CONTROLLER');
  }

  @Post()
  @ApiOperation({ summary: 'Borrow a book' })
  @ApiBody({ type: CreateBorrowingDto })
  @ApiResponse({
    status: 201,
    description: 'The book has been successfully borrowed.',
    type: BorrowingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Book not available or already borrowed.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  async borrow(@Body() createBorrowingDto: CreateBorrowingDto) {
    this.logger.info('POST /borrowings - Borrowing book', 'BORROWINGS_CONTROLLER', {
      bookId: createBorrowingDto.bookId,
      borrowerEmail: createBorrowingDto.borrowerEmail,
    });
    try {
      const borrowing = await this.borrowingsService.borrow(createBorrowingDto);
      this.logger.info('Book borrowing successful', 'BORROWINGS_CONTROLLER', {
        borrowingId: borrowing.id,
      });
      return borrowing;
    } catch (error) {
      this.logger.error(
        'Failed to borrow book',
        error.stack,
        'BORROWINGS_CONTROLLER',
        { createBorrowingDto },
      );
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all borrowings' })
  @ApiQuery({ name: 'borrowerEmail', required: false, type: String, description: 'Filter by borrower email' })
  @ApiQuery({ name: 'bookId', required: false, type: Number, description: 'Filter by book ID' })
  @ApiResponse({
    status: 200,
    description: 'List of all borrowings',
    type: [BorrowingResponseDto],
  })
  async findAll(
    @Query('borrowerEmail') borrowerEmail?: string,
    @Query('bookId') bookId?: string,
  ) {
    this.logger.debug('GET /borrowings - Fetching borrowings', 'BORROWINGS_CONTROLLER', {
      filters: { borrowerEmail, bookId },
    });

    let result;
    if (borrowerEmail) {
      this.logger.info(`Filtering borrowings by borrower: ${borrowerEmail}`, 'BORROWINGS_CONTROLLER');
      result = await this.borrowingsService.findByBorrower(borrowerEmail);
    } else if (bookId) {
      this.logger.info(`Filtering borrowings by book: ${bookId}`, 'BORROWINGS_CONTROLLER');
      result = await this.borrowingsService.findByBook(Number(bookId));
    } else {
      result = await this.borrowingsService.findAll();
    }

    this.logger.verbose(`Returning ${result.length} borrowings`, 'BORROWINGS_CONTROLLER', {
      count: result.length,
    });
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a borrowing by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Borrowing ID' })
  @ApiResponse({
    status: 200,
    description: 'The borrowing details',
    type: BorrowingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Borrowing not found.' })
  async findOne(@Param('id') id: string) {
    this.logger.debug(`GET /borrowings/${id} - Fetching borrowing`, 'BORROWINGS_CONTROLLER', {
      borrowingId: id,
    });
    try {
      const borrowing = await this.borrowingsService.findOne(+id);
      this.logger.verbose('Borrowing retrieved successfully', 'BORROWINGS_CONTROLLER', {
        borrowingId: borrowing.id,
        bookId: borrowing.bookId,
      });
      return borrowing;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve borrowing ${id}`,
        error.stack,
        'BORROWINGS_CONTROLLER',
        { borrowingId: id },
      );
      throw error;
    }
  }

  @Patch(':id/return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return a borrowed book' })
  @ApiParam({ name: 'id', type: Number, description: 'Borrowing ID' })
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully returned.',
    type: BorrowingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Book already returned.' })
  @ApiResponse({ status: 404, description: 'Borrowing not found.' })
  async returnBook(@Param('id') id: string) {
    this.logger.info(`PATCH /borrowings/${id}/return - Returning book`, 'BORROWINGS_CONTROLLER', {
      borrowingId: id,
    });
    try {
      const borrowing = await this.borrowingsService.returnBook(+id);
      this.logger.info('Book return successful', 'BORROWINGS_CONTROLLER', {
        borrowingId: borrowing.id,
        status: borrowing.status,
      });
      return borrowing;
    } catch (error) {
      this.logger.error(
        `Failed to return book for borrowing ${id}`,
        error.stack,
        'BORROWINGS_CONTROLLER',
        { borrowingId: id },
      );
      throw error;
    }
  }
}

