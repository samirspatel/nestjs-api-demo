import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class BooksService {
  private books: Book[] = [];
  private nextId = 1;

  constructor(private readonly logger: LoggerService) {
    this.logger.info('BooksService initialized', 'BOOKS_SERVICE');
  }

  create(createBookDto: CreateBookDto): Book {
    this.logger.debug('Creating new book', 'BOOKS_SERVICE', {
      title: createBookDto.title,
      isbn: createBookDto.isbn,
      authorId: createBookDto.authorId,
    });

    // Check if ISBN already exists
    const existingBook = this.books.find(book => book.isbn === createBookDto.isbn);
    if (existingBook) {
      this.logger.warn('Attempted to create book with duplicate ISBN', 'BOOKS_SERVICE', {
        isbn: createBookDto.isbn,
        existingBookId: existingBook.id,
      });
      throw new BadRequestException('A book with this ISBN already exists');
    }

    const book: Book = {
      id: this.nextId++,
      ...createBookDto,
      available: createBookDto.available ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.books.push(book);
    this.logger.info('Book created successfully', 'BOOKS_SERVICE', {
      bookId: book.id,
      title: book.title,
      isbn: book.isbn,
    });
    this.logger.logBusinessEvent('BOOK_CREATED', {
      bookId: book.id,
      title: book.title,
    });

    return book;
  }

  findAll(): Book[] {
    this.logger.debug('Fetching all books', 'BOOKS_SERVICE', {
      totalBooks: this.books.length,
    });
    const books = this.books;
    this.logger.verbose(`Retrieved ${books.length} books`, 'BOOKS_SERVICE');
    return books;
  }

  findOne(id: number): Book {
    this.logger.debug(`Fetching book with ID: ${id}`, 'BOOKS_SERVICE', { bookId: id });
    const book = this.books.find(book => book.id === id);
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

  findByAuthor(authorId: number): Book[] {
    this.logger.debug(`Fetching books by author: ${authorId}`, 'BOOKS_SERVICE', {
      authorId,
    });
    const books = this.books.filter(book => book.authorId === authorId);
    this.logger.info(`Found ${books.length} books for author ${authorId}`, 'BOOKS_SERVICE', {
      authorId,
      count: books.length,
    });
    return books;
  }

  findByGenre(genre: string): Book[] {
    this.logger.debug(`Searching books by genre: ${genre}`, 'BOOKS_SERVICE', {
      genre,
    });
    const books = this.books.filter(book => 
      book.genre?.toLowerCase().includes(genre.toLowerCase())
    );
    this.logger.info(`Found ${books.length} books in genre "${genre}"`, 'BOOKS_SERVICE', {
      genre,
      count: books.length,
    });
    return books;
  }

  findAvailable(): Book[] {
    this.logger.debug('Fetching available books', 'BOOKS_SERVICE');
    const books = this.books.filter(book => book.available === true);
    this.logger.info(`Found ${books.length} available books`, 'BOOKS_SERVICE', {
      availableCount: books.length,
      totalCount: this.books.length,
    });
    return books;
  }

  update(id: number, updateBookDto: UpdateBookDto): Book {
    this.logger.debug(`Updating book with ID: ${id}`, 'BOOKS_SERVICE', {
      bookId: id,
      updates: updateBookDto,
    });

    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
      this.logger.warn(`Book not found for update: ${id}`, 'BOOKS_SERVICE', {
        bookId: id,
      });
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const oldBook = { ...this.books[bookIndex] };

    // Check if ISBN is being updated and already exists
    if (updateBookDto.isbn) {
      const existingBook = this.books.find(
        book => book.isbn === updateBookDto.isbn && book.id !== id
      );
      if (existingBook) {
        this.logger.warn('Attempted to update book with duplicate ISBN', 'BOOKS_SERVICE', {
          bookId: id,
          isbn: updateBookDto.isbn,
          existingBookId: existingBook.id,
        });
        throw new BadRequestException('A book with this ISBN already exists');
      }
    }

    const updatedBook = {
      ...this.books[bookIndex],
      ...updateBookDto,
      updatedAt: new Date(),
    };

    this.books[bookIndex] = updatedBook;
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

  remove(id: number): void {
    this.logger.debug(`Deleting book with ID: ${id}`, 'BOOKS_SERVICE', { bookId: id });
    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
      this.logger.warn(`Book not found for deletion: ${id}`, 'BOOKS_SERVICE', {
        bookId: id,
      });
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const deletedBook = this.books[bookIndex];
    this.books.splice(bookIndex, 1);
    this.logger.info('Book deleted successfully', 'BOOKS_SERVICE', {
      bookId: id,
      title: deletedBook.title,
    });
    this.logger.logBusinessEvent('BOOK_DELETED', {
      bookId: id,
      title: deletedBook.title,
    });
  }
}

