import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookResponseDto } from './dto/book-response.dto';
import { Inject } from '@nestjs/common';
import { Logger } from 'common-sense-logger';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    @Inject('LOGGER')
    private readonly logger: Logger,
  ) {
    this.logger.info('[BOOKS_CONTROLLER] BooksController initialized');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiBody({ type: CreateBookDto })
  @ApiResponse({
    status: 201,
    description: 'The book has been successfully created.',
    type: BookResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input or ISBN already exists.' })
  async create(@Body() createBookDto: CreateBookDto) {
    this.logger.info('[BOOKS_CONTROLLER] POST /books - Creating new book', {
      title: createBookDto.title,
      isbn: createBookDto.isbn,
    });
    try {
      const book = await this.booksService.create(createBookDto);
      this.logger.info('[BOOKS_CONTROLLER] Book creation successful', {
        bookId: book.id,
      });
      return book;
    } catch (error) {
      this.logger.error('[BOOKS_CONTROLLER] Failed to create book', {
        createBookDto,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiQuery({ name: 'authorId', required: false, type: Number, description: 'Filter by author ID' })
  @ApiQuery({ name: 'genre', required: false, type: String, description: 'Filter by genre' })
  @ApiQuery({
    name: 'available',
    required: false,
    type: Boolean,
    description: 'Filter by availability',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all books',
    type: [BookResponseDto],
  })
  async findAll(
    @Query('authorId') authorId?: string,
    @Query('genre') genre?: string,
    @Query('available') available?: string,
  ) {
    this.logger.debug('[BOOKS_CONTROLLER] GET /books - Fetching books', {
      filters: { authorId, genre, available },
    });

    let result;
    if (authorId) {
      this.logger.info(`[BOOKS_CONTROLLER] Filtering books by author: ${authorId}`);
      result = await this.booksService.findByAuthor(Number(authorId));
    } else if (genre) {
      this.logger.info(`[BOOKS_CONTROLLER] Filtering books by genre: ${genre}`);
      result = await this.booksService.findByGenre(genre);
    } else if (available === 'true') {
      this.logger.info('[BOOKS_CONTROLLER] Filtering available books');
      result = await this.booksService.findAvailable();
    } else {
      result = await this.booksService.findAll();
    }

    this.logger.debug(`[BOOKS_CONTROLLER] Returning ${result.length} books`, {
      count: result.length,
    });
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Book ID' })
  @ApiResponse({
    status: 200,
    description: 'The book details',
    type: BookResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  async findOne(@Param('id') id: string) {
    this.logger.debug(`[BOOKS_CONTROLLER] GET /books/${id} - Fetching book`, {
      bookId: id,
    });
    try {
      const book = await this.booksService.findOne(+id);
      this.logger.debug('[BOOKS_CONTROLLER] Book retrieved successfully', {
        bookId: book.id,
        title: book.title,
      });
      return book;
    } catch (error) {
      this.logger.error(`[BOOKS_CONTROLLER] Failed to retrieve book ${id}`, {
        bookId: id,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  @ApiParam({ name: 'id', type: Number, description: 'Book ID' })
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully updated.',
    type: BookResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input.' })
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    this.logger.info(`[BOOKS_CONTROLLER] PATCH /books/${id} - Updating book`, {
      bookId: id,
      updates: Object.keys(updateBookDto),
    });
    try {
      const book = await this.booksService.update(+id, updateBookDto);
      this.logger.info('[BOOKS_CONTROLLER] Book update successful', {
        bookId: book.id,
      });
      return book;
    } catch (error) {
      this.logger.error(`[BOOKS_CONTROLLER] Failed to update book ${id}`, {
        bookId: id,
        updateBookDto,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a book' })
  @ApiParam({ name: 'id', type: Number, description: 'Book ID' })
  @ApiResponse({ status: 204, description: 'The book has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  async remove(@Param('id') id: string) {
    this.logger.info(`[BOOKS_CONTROLLER] DELETE /books/${id} - Deleting book`, {
      bookId: id,
    });
    try {
      await this.booksService.remove(+id);
      this.logger.info('[BOOKS_CONTROLLER] Book deletion successful', {
        bookId: id,
      });
    } catch (error) {
      this.logger.error(`[BOOKS_CONTROLLER] Failed to delete book ${id}`, {
        bookId: id,
        stack: error.stack,
      });
      throw error;
    }
  }
}
