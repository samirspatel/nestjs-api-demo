import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Logger } from 'common-sense-logger';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @Inject('LOGGER')
    private readonly logger: Logger,
  ) {
    this.logger.info('[BOOKS_SERVICE] BooksService initialized');
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    this.logger.debug('[BOOKS_SERVICE] Creating new book', {
      title: createBookDto.title,
      isbn: createBookDto.isbn,
      authorId: createBookDto.authorId,
    });

    // Check if ISBN already exists
    const existingBook = await this.bookRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });
    if (existingBook) {
      this.logger.warn('[BOOKS_SERVICE] Attempted to create book with duplicate ISBN', {
        isbn: createBookDto.isbn,
        existingBookId: existingBook.id,
      });
      throw new BadRequestException('A book with this ISBN already exists');
    }

    const book = this.bookRepository.create({
      ...createBookDto,
      available: createBookDto.available ?? true,
    });

    const savedBook = await this.bookRepository.save(book);
    this.logger.info('[BOOKS_SERVICE] Book created successfully', {
      bookId: savedBook.id,
      title: savedBook.title,
      isbn: savedBook.isbn,
    });
    this.logger.info('[BUSINESS_EVENT] BOOK_CREATED', {
      bookId: savedBook.id,
      title: savedBook.title,
    });

    return savedBook;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [books, total] = await this.bookRepository.findAndCount({
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    const totalPages = Math.ceil(total / limit);

    this.logger.debug('[BOOKS_SERVICE] Fetching books with pagination', {
      page,
      limit,
      total,
      totalPages,
      returned: books.length,
    });

    return {
      data: books,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Book> {
    this.logger.debug(`[BOOKS_SERVICE] Fetching book with ID: ${id}`, { bookId: id });
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      this.logger.warn(`[BOOKS_SERVICE] Book not found: ${id}`, { bookId: id });
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    this.logger.debug('[BOOKS_SERVICE] Book found', {
      bookId: book.id,
      title: book.title,
    });
    return book;
  }

  async findByAuthor(
    authorId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [books, total] = await this.bookRepository.findAndCount({
      where: { authorId },
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    const totalPages = Math.ceil(total / limit);

    this.logger.info(`[BOOKS_SERVICE] Found ${books.length} books for author ${authorId}`, {
      authorId,
      count: books.length,
      total,
      page,
      totalPages,
    });

    return {
      data: books,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByGenre(
    genre: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .where('LOWER(book.genre) LIKE LOWER(:genre)', { genre: `%${genre}%` })
      .orderBy('book.id', 'ASC');

    const [books, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    this.logger.info(`[BOOKS_SERVICE] Found ${books.length} books in genre "${genre}"`, {
      genre,
      count: books.length,
      total,
      page,
      totalPages,
    });

    return {
      data: books,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findAvailable(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [books, total] = await this.bookRepository.findAndCount({
      where: { available: true },
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    const totalPages = Math.ceil(total / limit);

    this.logger.info(`[BOOKS_SERVICE] Found ${books.length} available books`, {
      availableCount: books.length,
      total,
      page,
      totalPages,
    });

    return {
      data: books,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    this.logger.debug(`[BOOKS_SERVICE] Updating book with ID: ${id}`, {
      bookId: id,
      updates: updateBookDto,
    });

    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      this.logger.warn(`[BOOKS_SERVICE] Book not found for update: ${id}`, {
        bookId: id,
      });
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const oldBook = { ...book };

    // Check if ISBN is being updated and already exists
    if (updateBookDto.isbn) {
      const existingBook = await this.bookRepository.findOne({
        where: { isbn: updateBookDto.isbn },
      });
      if (existingBook && existingBook.id !== id) {
        this.logger.warn('[BOOKS_SERVICE] Attempted to update book with duplicate ISBN', {
          bookId: id,
          isbn: updateBookDto.isbn,
          existingBookId: existingBook.id,
        });
        throw new BadRequestException('A book with this ISBN already exists');
      }
    }

    Object.assign(book, updateBookDto);
    const updatedBook = await this.bookRepository.save(book);

    this.logger.info('[BOOKS_SERVICE] Book updated successfully', {
      bookId: id,
      changes: Object.keys(updateBookDto),
    });
    this.logger.info('[BUSINESS_EVENT] BOOK_UPDATED', {
      bookId: id,
      title: updatedBook.title,
      changes: updateBookDto,
    });
    this.logger.debug('[BOOKS_SERVICE] Book update details', {
      bookId: id,
      before: oldBook,
      after: updatedBook,
    });

    return updatedBook;
  }

  async remove(id: number): Promise<void> {
    this.logger.debug(`[BOOKS_SERVICE] Deleting book with ID: ${id}`, { bookId: id });
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      this.logger.warn(`[BOOKS_SERVICE] Book not found for deletion: ${id}`, {
        bookId: id,
      });
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    await this.bookRepository.remove(book);
    this.logger.info('[BOOKS_SERVICE] Book deleted successfully', {
      bookId: id,
      title: book.title,
    });
    this.logger.info('[BUSINESS_EVENT] BOOK_DELETED', {
      bookId: id,
      title: book.title,
    });
  }
}
