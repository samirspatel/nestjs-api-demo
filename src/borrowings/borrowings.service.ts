import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Borrowing } from './entities/borrowing.entity';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { BooksService } from '../books/books.service';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class BorrowingsService {
  private borrowings: Borrowing[] = [];
  private nextId = 1;
  private readonly DEFAULT_BORROW_DAYS = 14;

  constructor(
    private readonly booksService: BooksService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('BorrowingsService initialized', 'BORROWINGS_SERVICE');
    // Start checking for overdue books periodically
    this.startOverdueCheck();
  }

  async borrow(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    this.logger.info('Processing book borrowing request', 'BORROWINGS_SERVICE', {
      bookId: createBorrowingDto.bookId,
      borrowerEmail: createBorrowingDto.borrowerEmail,
    });

    // Check if book exists
    let book;
    try {
      book = this.booksService.findOne(createBorrowingDto.bookId);
    } catch (error) {
      this.logger.error(
        `Book not found for borrowing: ${createBorrowingDto.bookId}`,
        error.stack,
        'BORROWINGS_SERVICE',
        { bookId: createBorrowingDto.bookId },
      );
      throw new NotFoundException(`Book with ID ${createBorrowingDto.bookId} not found`);
    }

    // Check if book is available
    if (!book.available) {
      this.logger.warn('Attempted to borrow unavailable book', 'BORROWINGS_SERVICE', {
        bookId: book.id,
        title: book.title,
        borrowerEmail: createBorrowingDto.borrowerEmail,
      });
      throw new BadRequestException(`Book "${book.title}" is not available for borrowing`);
    }

    // Check if borrower already has this book borrowed
    const existingBorrowing = this.borrowings.find(
      b => b.bookId === createBorrowingDto.bookId &&
           b.borrowerEmail === createBorrowingDto.borrowerEmail &&
           b.status === 'BORROWED'
    );

    if (existingBorrowing) {
      this.logger.warn('Attempted to borrow already borrowed book', 'BORROWINGS_SERVICE', {
        bookId: createBorrowingDto.bookId,
        borrowerEmail: createBorrowingDto.borrowerEmail,
        existingBorrowingId: existingBorrowing.id,
      });
      throw new BadRequestException('You have already borrowed this book');
    }

    const borrowDays = createBorrowingDto.borrowDays || this.DEFAULT_BORROW_DAYS;
    const borrowedDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    const borrowing: Borrowing = {
      id: this.nextId++,
      ...createBorrowingDto,
      borrowedDate,
      dueDate,
      status: 'BORROWED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.borrowings.push(borrowing);

    // Mark book as unavailable
    this.booksService.update(book.id, { available: false });

    this.logger.info('Book borrowed successfully', 'BORROWINGS_SERVICE', {
      borrowingId: borrowing.id,
      bookId: book.id,
      bookTitle: book.title,
      borrowerEmail: borrowing.borrowerEmail,
      dueDate: dueDate.toISOString(),
    });
    this.logger.logBusinessEvent('BOOK_BORROWED', {
      borrowingId: borrowing.id,
      bookId: book.id,
      borrowerEmail: borrowing.borrowerEmail,
      dueDate: dueDate.toISOString(),
    });

    return borrowing;
  }

  findAll(): Borrowing[] {
    this.logger.debug('Fetching all borrowings', 'BORROWINGS_SERVICE', {
      totalBorrowings: this.borrowings.length,
    });
    return this.borrowings;
  }

  findOne(id: number): Borrowing {
    this.logger.debug(`Fetching borrowing with ID: ${id}`, 'BORROWINGS_SERVICE', {
      borrowingId: id,
    });
    const borrowing = this.borrowings.find(b => b.id === id);
    if (!borrowing) {
      this.logger.warn(`Borrowing not found: ${id}`, 'BORROWINGS_SERVICE', {
        borrowingId: id,
      });
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }
    return borrowing;
  }

  findByBorrower(email: string): Borrowing[] {
    this.logger.debug(`Fetching borrowings for borrower: ${email}`, 'BORROWINGS_SERVICE', {
      borrowerEmail: email,
    });
    const borrowings = this.borrowings.filter(b => b.borrowerEmail === email);
    this.logger.info(`Found ${borrowings.length} borrowings for ${email}`, 'BORROWINGS_SERVICE', {
      borrowerEmail: email,
      count: borrowings.length,
    });
    return borrowings;
  }

  findByBook(bookId: number): Borrowing[] {
    this.logger.debug(`Fetching borrowings for book: ${bookId}`, 'BORROWINGS_SERVICE', {
      bookId,
    });
    const borrowings = this.borrowings.filter(b => b.bookId === bookId);
    this.logger.verbose(`Found ${borrowings.length} borrowings for book ${bookId}`, 'BORROWINGS_SERVICE', {
      bookId,
      count: borrowings.length,
    });
    return borrowings;
  }

  async returnBook(id: number): Promise<Borrowing> {
    this.logger.info(`Processing book return for borrowing: ${id}`, 'BORROWINGS_SERVICE', {
      borrowingId: id,
    });

    const borrowing = this.findOne(id);

    if (borrowing.status === 'RETURNED') {
      this.logger.warn('Attempted to return already returned book', 'BORROWINGS_SERVICE', {
        borrowingId: id,
        bookId: borrowing.bookId,
      });
      throw new BadRequestException('This book has already been returned');
    }

    const returnedDate = new Date();
    const wasOverdue = borrowing.status === 'OVERDUE' || returnedDate > borrowing.dueDate;

    borrowing.status = 'RETURNED';
    borrowing.returnedDate = returnedDate;
    borrowing.updatedAt = new Date();

    // Mark book as available
    try {
      const book = this.booksService.findOne(borrowing.bookId);
      this.booksService.update(book.id, { available: true });
      this.logger.debug('Book marked as available', 'BORROWINGS_SERVICE', {
        bookId: book.id,
      });
    } catch (error) {
      this.logger.error(
        `Failed to mark book as available: ${borrowing.bookId}`,
        error.stack,
        'BORROWINGS_SERVICE',
        { bookId: borrowing.bookId },
      );
    }

    this.logger.info('Book returned successfully', 'BORROWINGS_SERVICE', {
      borrowingId: id,
      bookId: borrowing.bookId,
      borrowerEmail: borrowing.borrowerEmail,
      wasOverdue,
      daysLate: wasOverdue
        ? Math.floor((returnedDate.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    });
    this.logger.logBusinessEvent('BOOK_RETURNED', {
      borrowingId: id,
      bookId: borrowing.bookId,
      borrowerEmail: borrowing.borrowerEmail,
      wasOverdue,
    });

    return borrowing;
  }

  private startOverdueCheck(): void {
    // Check for overdue books every hour
    setInterval(() => {
      this.checkOverdueBooks();
    }, 60 * 60 * 1000);

    // Initial check
    this.checkOverdueBooks();
  }

  private checkOverdueBooks(): void {
    this.logger.debug('Checking for overdue books', 'BORROWINGS_SERVICE');
    const now = new Date();
    let overdueCount = 0;

    this.borrowings.forEach(borrowing => {
      if (borrowing.status === 'BORROWED' && now > borrowing.dueDate) {
        borrowing.status = 'OVERDUE';
        borrowing.updatedAt = new Date();
        overdueCount++;

        this.logger.warn('Book marked as overdue', 'BORROWINGS_SERVICE', {
          borrowingId: borrowing.id,
          bookId: borrowing.bookId,
          borrowerEmail: borrowing.borrowerEmail,
          dueDate: borrowing.dueDate.toISOString(),
          daysOverdue: Math.floor(
            (now.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        });
      }
    });

    if (overdueCount > 0) {
      this.logger.warn(`Found ${overdueCount} overdue book(s)`, 'BORROWINGS_SERVICE', {
        overdueCount,
      });
    } else {
      this.logger.verbose('No overdue books found', 'BORROWINGS_SERVICE');
    }
  }
}

