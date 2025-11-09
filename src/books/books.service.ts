import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('BooksService initialized', 'BOOKS_SERVICE');
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    this.logger.debug('Creating new book', 'BOOKS_SERVICE', {
      title: createBookDto.title,
      isbn: createBookDto.isbn,
      authorId: createBookDto.authorId,
    });

    // Check if ISBN already exists
    const existingBook = await this.bookRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });
    if (existingBook) {
      this.logger.warn('Attempted to create book with duplicate ISBN', 'BOOKS_SERVICE', {
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
    this.logger.info('Book created successfully', 'BOOKS_SERVICE', {
      bookId: savedBook.id,
      title: savedBook.title,
      isbn: savedBook.isbn,
    });
    this.logger.logBusinessEvent('BOOK_CREATED', {
      bookId: savedBook.id,
      title: savedBook.title,
    });

    return savedBook;
  }

  async findAll(): Promise<Book[]> {
    const books = await this.bookRepository.find();
    this.logger.debug('Fetching all books', 'BOOKS_SERVICE', {
      totalBooks: books.length,
    });
    this.logger.verbose(`Retrieved ${books.length} books`, 'BOOKS_SERVICE');
    return books;
  }

  async findOne(id: number): Promise<Book> {
    this.logger.debug(`Fetching book with ID: ${id}`, 'BOOKS_SERVICE', { bookId: id });
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      this.logger.warn(`Book not found: ${id}`, 'BOOKS_SERVICE', { bookId: id });
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    this.logger.debug('Book found', 'BOOKS_SERVICE', {
      bookId: book.id,
      title: book.title,
    });
    return book;
  }

  async findByAuthor(authorId: number): Promise<Book[]> {
    this.logger.debug(`Fetching books by author: ${authorId}`, 'BOOKS_SERVICE', {
      authorId,
    });
    const books = await this.bookRepository.find({
      where: { authorId },
    });
    this.logger.info(`Found ${books.length} books for author ${authorId}`, 'BOOKS_SERVICE', {
      authorId,
      count: books.length,
    });
    return books;
  }

  async findByGenre(genre: string): Promise<Book[]> {
    this.logger.debug(`Searching books by genre: ${genre}`, 'BOOKS_SERVICE', {
      genre,
    });
    const books = await this.bookRepository
      .createQueryBuilder('book')
      .where('LOWER(book.genre) LIKE LOWER(:genre)', { genre: `%${genre}%` })
      .getMany();
    this.logger.info(`Found ${books.length} books in genre "${genre}"`, 'BOOKS_SERVICE', {
      genre,
      count: books.length,
    });
    return books;
  }

  async findAvailable(): Promise<Book[]> {
    this.logger.debug('Fetching available books', 'BOOKS_SERVICE');
    const books = await this.bookRepository.find({
      where: { available: true },
    });
    const totalCount = await this.bookRepository.count();
    this.logger.info(`Found ${books.length} available books`, 'BOOKS_SERVICE', {
      availableCount: books.length,
      totalCount,
    });
    return books;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    this.logger.debug(`Updating book with ID: ${id}`, 'BOOKS_SERVICE', {
      bookId: id,
      updates: updateBookDto,
    });

    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      this.logger.warn(`Book not found for update: ${id}`, 'BOOKS_SERVICE', {
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
        this.logger.warn('Attempted to update book with duplicate ISBN', 'BOOKS_SERVICE', {
          bookId: id,
          isbn: updateBookDto.isbn,
          existingBookId: existingBook.id,
        });
        throw new BadRequestException('A book with this ISBN already exists');
      }
    }

    Object.assign(book, updateBookDto);
    const updatedBook = await this.bookRepository.save(book);

    this.logger.info('Book updated successfully', 'BOOKS_SERVICE', {
      bookId: id,
      changes: Object.keys(updateBookDto),
    });
    this.logger.logBusinessEvent('BOOK_UPDATED', {
      bookId: id,
      title: updatedBook.title,
      changes: updateBookDto,
    });
    this.logger.verbose('Book update details', 'BOOKS_SERVICE', {
      bookId: id,
      before: oldBook,
      after: updatedBook,
    });

    return updatedBook;
  }

  async remove(id: number): Promise<void> {
    this.logger.debug(`Deleting book with ID: ${id}`, 'BOOKS_SERVICE', { bookId: id });
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      this.logger.warn(`Book not found for deletion: ${id}`, 'BOOKS_SERVICE', {
        bookId: id,
      });
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    await this.bookRepository.remove(book);
    this.logger.info('Book deleted successfully', 'BOOKS_SERVICE', {
      bookId: id,
      title: book.title,
    });
    this.logger.logBusinessEvent('BOOK_DELETED', {
      bookId: id,
      title: book.title,
    });
  }
}

