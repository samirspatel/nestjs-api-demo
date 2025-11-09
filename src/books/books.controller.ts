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
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('BooksController initialized', 'BOOKS_CONTROLLER');
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
    this.logger.info('POST /books - Creating new book', 'BOOKS_CONTROLLER', {
      title: createBookDto.title,
      isbn: createBookDto.isbn,
    });
    try {
      const book = await this.booksService.create(createBookDto);
      this.logger.info('Book creation successful', 'BOOKS_CONTROLLER', {
        bookId: book.id,
      });
      return book;
    } catch (error) {
      this.logger.error('Failed to create book', error.stack, 'BOOKS_CONTROLLER', {
        createBookDto,
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
    this.logger.debug('GET /books - Fetching books', 'BOOKS_CONTROLLER', {
      filters: { authorId, genre, available },
    });

    let result;
    if (authorId) {
      this.logger.info(`Filtering books by author: ${authorId}`, 'BOOKS_CONTROLLER');
      result = await this.booksService.findByAuthor(Number(authorId));
    } else if (genre) {
      this.logger.info(`Filtering books by genre: ${genre}`, 'BOOKS_CONTROLLER');
      result = await this.booksService.findByGenre(genre);
    } else if (available === 'true') {
      this.logger.info('Filtering available books', 'BOOKS_CONTROLLER');
      result = await this.booksService.findAvailable();
    } else {
      result = await this.booksService.findAll();
    }

    this.logger.verbose(`Returning ${result.length} books`, 'BOOKS_CONTROLLER', {
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
    this.logger.debug(`GET /books/${id} - Fetching book`, 'BOOKS_CONTROLLER', {
      bookId: id,
    });
    try {
      const book = await this.booksService.findOne(+id);
      this.logger.verbose('Book retrieved successfully', 'BOOKS_CONTROLLER', {
        bookId: book.id,
        title: book.title,
      });
      return book;
    } catch (error) {
      this.logger.error(`Failed to retrieve book ${id}`, error.stack, 'BOOKS_CONTROLLER', {
        bookId: id,
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
    this.logger.info(`PATCH /books/${id} - Updating book`, 'BOOKS_CONTROLLER', {
      bookId: id,
      updates: Object.keys(updateBookDto),
    });
    try {
      const book = await this.booksService.update(+id, updateBookDto);
      this.logger.info('Book update successful', 'BOOKS_CONTROLLER', {
        bookId: book.id,
      });
      return book;
    } catch (error) {
      this.logger.error(`Failed to update book ${id}`, error.stack, 'BOOKS_CONTROLLER', {
        bookId: id,
        updateBookDto,
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
    this.logger.info(`DELETE /books/${id} - Deleting book`, 'BOOKS_CONTROLLER', {
      bookId: id,
    });
    try {
      await this.booksService.remove(+id);
      this.logger.info('Book deletion successful', 'BOOKS_CONTROLLER', {
        bookId: id,
      });
    } catch (error) {
      this.logger.error(`Failed to delete book ${id}`, error.stack, 'BOOKS_CONTROLLER', {
        bookId: id,
      });
      throw error;
    }
  }
}
