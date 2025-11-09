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
  Inject,
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
import { Logger } from 'common-sense-logger';

@ApiTags('borrowings')
@Controller('borrowings')
export class BorrowingsController {
  constructor(
    private readonly borrowingsService: BorrowingsService,
    @Inject('LOGGER')
    private readonly logger: Logger,
  ) {
    this.logger.info('[BORROWINGS_CONTROLLER] BorrowingsController initialized');
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
    this.logger.info('[BORROWINGS_CONTROLLER] POST /borrowings - Borrowing book', {
      bookId: createBorrowingDto.bookId,
      borrowerName: createBorrowingDto.borrowerName,
    });
    try {
      const borrowing = await this.borrowingsService.borrow(createBorrowingDto);
      this.logger.info('[BORROWINGS_CONTROLLER] Book borrowing successful', {
        borrowingId: borrowing.id,
      });
      return borrowing;
    } catch (error) {
      this.logger.error('[BORROWINGS_CONTROLLER] Failed to borrow book', {
        createBorrowingDto,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all borrowings' })
  @ApiQuery({ name: 'bookId', required: false, type: Number, description: 'Filter by book ID' })
  @ApiResponse({
    status: 200,
    description: 'List of all borrowings',
    type: [BorrowingResponseDto],
  })
  async findAll(
    @Query('bookId') bookId?: string,
  ) {
    this.logger.debug('[BORROWINGS_CONTROLLER] GET /borrowings - Fetching borrowings', {
      filters: { bookId },
    });

    let result;
    if (bookId) {
      this.logger.info(`[BORROWINGS_CONTROLLER] Filtering borrowings by book: ${bookId}`);
      result = await this.borrowingsService.findByBook(Number(bookId));
    } else {
      result = await this.borrowingsService.findAll();
    }

    this.logger.debug(`[BORROWINGS_CONTROLLER] Returning ${result.length} borrowings`, {
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
    this.logger.debug(`[BORROWINGS_CONTROLLER] GET /borrowings/${id} - Fetching borrowing`, {
      borrowingId: id,
    });
    try {
      const borrowing = await this.borrowingsService.findOne(+id);
      this.logger.debug('[BORROWINGS_CONTROLLER] Borrowing retrieved successfully', {
        borrowingId: borrowing.id,
        bookId: borrowing.bookId,
      });
      return borrowing;
    } catch (error) {
      this.logger.error(`[BORROWINGS_CONTROLLER] Failed to retrieve borrowing ${id}`, {
        borrowingId: id,
        stack: error.stack,
      });
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
    this.logger.info(`[BORROWINGS_CONTROLLER] PATCH /borrowings/${id}/return - Returning book`, {
      borrowingId: id,
    });
    try {
      const borrowing = await this.borrowingsService.returnBook(+id);
      this.logger.info('[BORROWINGS_CONTROLLER] Book return successful', {
        borrowingId: borrowing.id,
        status: borrowing.status,
      });
      return borrowing;
    } catch (error) {
      this.logger.error(`[BORROWINGS_CONTROLLER] Failed to return book for borrowing ${id}`, {
        borrowingId: id,
        stack: error.stack,
      });
      throw error;
    }
  }
}
