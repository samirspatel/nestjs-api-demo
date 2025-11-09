import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { BooksService } from '../books/books.service';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class BorrowingsService {
  private readonly DEFAULT_BORROW_DAYS = 14;

  constructor(
    @InjectRepository(Borrowing)
    private readonly borrowingRepository: Repository<Borrowing>,
    private readonly booksService: BooksService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('BorrowingsService initialized', 'BORROWINGS_SERVICE');
    // Start checking for overdue books periodically (with delay to allow DB initialization)
    setTimeout(() => {
      this.startOverdueCheck();
    }, 5000); // Wait 5 seconds for database to be ready
  }

  async borrow(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    this.logger.info('Processing book borrowing request', 'BORROWINGS_SERVICE', {
      bookId: createBorrowingDto.bookId,
      borrowerEmail: createBorrowingDto.borrowerEmail,
    });

    // Check if book exists
    let book;
    try {
      book = await this.booksService.findOne(createBorrowingDto.bookId);
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
    const existingBorrowing = await this.borrowingRepository.findOne({
      where: {
        bookId: createBorrowingDto.bookId,
        borrowerEmail: createBorrowingDto.borrowerEmail,
        status: 'BORROWED',
      },
    });

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

    const borrowing = this.borrowingRepository.create({
      ...createBorrowingDto,
      borrowedDate,
      dueDate,
      status: 'BORROWED' as const,
    });

    const savedBorrowing = await this.borrowingRepository.save(borrowing);

    // Mark book as unavailable
    await this.booksService.update(book.id, { available: false });

    this.logger.info('Book borrowed successfully', 'BORROWINGS_SERVICE', {
      borrowingId: savedBorrowing.id,
      bookId: book.id,
      bookTitle: book.title,
      borrowerEmail: savedBorrowing.borrowerEmail,
      dueDate: dueDate.toISOString(),
    });
    this.logger.logBusinessEvent('BOOK_BORROWED', {
      borrowingId: savedBorrowing.id,
      bookId: book.id,
      borrowerEmail: savedBorrowing.borrowerEmail,
      dueDate: dueDate.toISOString(),
    });

    return savedBorrowing;
  }

  async findAll(): Promise<Borrowing[]> {
    const borrowings = await this.borrowingRepository.find();
    this.logger.debug('Fetching all borrowings', 'BORROWINGS_SERVICE', {
      totalBorrowings: borrowings.length,
    });
    return borrowings;
  }

  async findOne(id: number): Promise<Borrowing> {
    this.logger.debug(`Fetching borrowing with ID: ${id}`, 'BORROWINGS_SERVICE', {
      borrowingId: id,
    });
    const borrowing = await this.borrowingRepository.findOne({ where: { id } });
    if (!borrowing) {
      this.logger.warn(`Borrowing not found: ${id}`, 'BORROWINGS_SERVICE', {
        borrowingId: id,
      });
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }
    return borrowing;
  }

  async findByBorrower(email: string): Promise<Borrowing[]> {
    this.logger.debug(`Fetching borrowings for borrower: ${email}`, 'BORROWINGS_SERVICE', {
      borrowerEmail: email,
    });
    const borrowings = await this.borrowingRepository.find({
      where: { borrowerEmail: email },
    });
    this.logger.info(`Found ${borrowings.length} borrowings for ${email}`, 'BORROWINGS_SERVICE', {
      borrowerEmail: email,
      count: borrowings.length,
    });
    return borrowings;
  }

  async findByBook(bookId: number): Promise<Borrowing[]> {
    this.logger.debug(`Fetching borrowings for book: ${bookId}`, 'BORROWINGS_SERVICE', {
      bookId,
    });
    const borrowings = await this.borrowingRepository.find({
      where: { bookId },
    });
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

    const borrowing = await this.findOne(id);

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
    const updatedBorrowing = await this.borrowingRepository.save(borrowing);

    // Mark book as available
    try {
      const book = await this.booksService.findOne(borrowing.bookId);
      await this.booksService.update(book.id, { available: true });
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

    return updatedBorrowing;
  }

  private startOverdueCheck(): void {
    // Check for overdue books every hour
    setInterval(() => {
      this.checkOverdueBooks();
    }, 60 * 60 * 1000);

    // Initial check
    this.checkOverdueBooks();
  }

  private async checkOverdueBooks(): Promise<void> {
    try {
      this.logger.debug('Checking for overdue books', 'BORROWINGS_SERVICE');
      const now = new Date();
      
      const borrowedBooks = await this.borrowingRepository.find({
        where: { status: 'BORROWED' },
      });

      let overdueCount = 0;
      for (const borrowing of borrowedBooks) {
        if (now > borrowing.dueDate) {
          borrowing.status = 'OVERDUE';
          await this.borrowingRepository.save(borrowing);
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
      }

      if (overdueCount > 0) {
        this.logger.warn(`Found ${overdueCount} overdue book(s)`, 'BORROWINGS_SERVICE', {
          overdueCount,
        });
      } else {
        this.logger.verbose('No overdue books found', 'BORROWINGS_SERVICE');
      }
    } catch (error) {
      // Silently handle errors (e.g., tables not created yet)
      this.logger.debug('Could not check overdue books (tables may not exist yet)', 'BORROWINGS_SERVICE');
    }
  }
}

