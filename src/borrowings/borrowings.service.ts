import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { BooksService } from '../books/books.service';
import { Logger } from 'common-sense-logger';

@Injectable()
export class BorrowingsService {
  private readonly DEFAULT_BORROW_DAYS = 14;

  constructor(
    @InjectRepository(Borrowing)
    private readonly borrowingRepository: Repository<Borrowing>,
    private readonly booksService: BooksService,
    @Inject('LOGGER')
    private readonly logger: Logger,
  ) {
    this.logger.info('[BORROWINGS_SERVICE] BorrowingsService initialized');
    // Start checking for overdue books periodically (with delay to allow DB initialization)
    setTimeout(() => {
      this.startOverdueCheck();
    }, 5000); // Wait 5 seconds for database to be ready
  }

  async borrow(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    this.logger.info('[BORROWINGS_SERVICE] Processing book borrowing request', {
      bookId: createBorrowingDto.bookId,
      borrowerEmail: createBorrowingDto.borrowerEmail,
    });

    // Check if book exists
    let book;
    try {
      book = await this.booksService.findOne(createBorrowingDto.bookId);
    } catch (error) {
      this.logger.error(
        `[BORROWINGS_SERVICE] Book not found for borrowing: ${createBorrowingDto.bookId}`,
        {
          bookId: createBorrowingDto.bookId,
          stack: error.stack,
        },
      );
      throw new NotFoundException(`Book with ID ${createBorrowingDto.bookId} not found`);
    }

    // Check if book is available
    if (!book.available) {
      this.logger.warn('[BORROWINGS_SERVICE] Attempted to borrow unavailable book', {
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
      this.logger.warn('[BORROWINGS_SERVICE] Attempted to borrow already borrowed book', {
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

    this.logger.info('[BORROWINGS_SERVICE] Book borrowed successfully', {
      borrowingId: savedBorrowing.id,
      bookId: book.id,
      bookTitle: book.title,
      borrowerEmail: savedBorrowing.borrowerEmail,
      dueDate: dueDate.toISOString(),
    });
    this.logger.info('[BUSINESS_EVENT] BOOK_BORROWED', {
      borrowingId: savedBorrowing.id,
      bookId: book.id,
      borrowerEmail: savedBorrowing.borrowerEmail,
      dueDate: dueDate.toISOString(),
    });

    return savedBorrowing;
  }

  async findAll(): Promise<Borrowing[]> {
    const borrowings = await this.borrowingRepository.find();
    this.logger.debug('[BORROWINGS_SERVICE] Fetching all borrowings', {
      totalBorrowings: borrowings.length,
    });
    return borrowings;
  }

  async findOne(id: number): Promise<Borrowing> {
    this.logger.debug(`[BORROWINGS_SERVICE] Fetching borrowing with ID: ${id}`, {
      borrowingId: id,
    });
    const borrowing = await this.borrowingRepository.findOne({ where: { id } });
    if (!borrowing) {
      this.logger.warn(`[BORROWINGS_SERVICE] Borrowing not found: ${id}`, {
        borrowingId: id,
      });
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }
    return borrowing;
  }

  async findByBorrower(email: string): Promise<Borrowing[]> {
    this.logger.debug(`[BORROWINGS_SERVICE] Fetching borrowings for borrower: ${email}`, {
      borrowerEmail: email,
    });
    const borrowings = await this.borrowingRepository.find({
      where: { borrowerEmail: email },
    });
    this.logger.info(`[BORROWINGS_SERVICE] Found ${borrowings.length} borrowings for ${email}`, {
      borrowerEmail: email,
      count: borrowings.length,
    });
    return borrowings;
  }

  async findByBook(bookId: number): Promise<Borrowing[]> {
    this.logger.debug(`[BORROWINGS_SERVICE] Fetching borrowings for book: ${bookId}`, {
      bookId,
    });
    const borrowings = await this.borrowingRepository.find({
      where: { bookId },
    });
    this.logger.debug(`[BORROWINGS_SERVICE] Found ${borrowings.length} borrowings for book ${bookId}`, {
      bookId,
      count: borrowings.length,
    });
    return borrowings;
  }

  async returnBook(id: number): Promise<Borrowing> {
    this.logger.info(`[BORROWINGS_SERVICE] Processing book return for borrowing: ${id}`, {
      borrowingId: id,
    });

    const borrowing = await this.findOne(id);

    if (borrowing.status === 'RETURNED') {
      this.logger.warn('[BORROWINGS_SERVICE] Attempted to return already returned book', {
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
      this.logger.debug('[BORROWINGS_SERVICE] Book marked as available', {
        bookId: book.id,
      });
    } catch (error) {
      this.logger.error(
        `[BORROWINGS_SERVICE] Failed to mark book as available: ${borrowing.bookId}`,
        {
          bookId: borrowing.bookId,
          stack: error.stack,
        },
      );
    }

    this.logger.info('[BORROWINGS_SERVICE] Book returned successfully', {
      borrowingId: id,
      bookId: borrowing.bookId,
      borrowerEmail: borrowing.borrowerEmail,
      wasOverdue,
      daysLate: wasOverdue
        ? Math.floor((returnedDate.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    });
    this.logger.info('[BUSINESS_EVENT] BOOK_RETURNED', {
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
      this.logger.debug('[BORROWINGS_SERVICE] Checking for overdue books');
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

          this.logger.warn('[BORROWINGS_SERVICE] Book marked as overdue', {
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
        this.logger.warn(`[BORROWINGS_SERVICE] Found ${overdueCount} overdue book(s)`, {
          overdueCount,
        });
      } else {
        this.logger.debug('[BORROWINGS_SERVICE] No overdue books found');
      }
    } catch (error) {
      // Silently handle errors (e.g., tables not created yet)
      this.logger.debug('[BORROWINGS_SERVICE] Could not check overdue books (tables may not exist yet)');
    }
  }
}
