# Comprehensive Logging Examples

This document demonstrates the comprehensive logging implementation using `common-sense-logger` throughout the NestJS API demo.

## Log Levels and Usage

### 1. INFO Level - General Operational Messages

**Use Case**: Successful operations, application lifecycle events, business events

**Examples from the codebase:**

```typescript
// Application startup
logger.info('Starting Library Management API...', 'BOOTSTRAP');
logger.info('Application is running on: http://localhost:3000', 'BOOTSTRAP');

// Successful operations
logger.info('Book created successfully', 'BOOKS_SERVICE', {
  bookId: book.id,
  title: book.title,
  isbn: book.isbn,
});

// Business events
logger.logBusinessEvent('BOOK_CREATED', {
  bookId: book.id,
  title: book.title,
});

// Controller operations
logger.info('POST /books - Creating new book', 'BOOKS_CONTROLLER', {
  title: createBookDto.title,
  isbn: createBookDto.isbn,
});
```

### 2. DEBUG Level - Detailed Diagnostic Information

**Use Case**: Method entry/exit, query parameters, data retrieval details

**Examples from the codebase:**

```typescript
// Service method entry
logger.debug('Creating new book', 'BOOKS_SERVICE', {
  title: createBookDto.title,
  isbn: createBookDto.isbn,
  authorId: createBookDto.authorId,
});

// HTTP request details
logger.debug('GET /books - Fetching books', 'BOOKS_CONTROLLER', {
  filters: { authorId, genre, available },
});

// Data retrieval
logger.debug(`Fetching book with ID: ${id}`, 'BOOKS_SERVICE', { bookId: id });
logger.debug('Fetching all books', 'BOOKS_SERVICE', {
  totalBooks: this.books.length,
});
```

### 3. WARN Level - Warning Messages

**Use Case**: Potential issues, not found resources, validation failures

**Examples from the codebase:**

```typescript
// Duplicate detection
logger.warn('Attempted to create book with duplicate ISBN', 'BOOKS_SERVICE', {
  isbn: createBookDto.isbn,
  existingBookId: existingBook.id,
});

// Resource not found
logger.warn(`Book not found: ${id}`, 'BOOKS_SERVICE', { bookId: id });

// Business rule violations
logger.warn('Attempted to borrow unavailable book', 'BORROWINGS_SERVICE', {
  bookId: book.id,
  title: book.title,
  borrowerEmail: createBorrowingDto.borrowerEmail,
});

// Overdue books
logger.warn('Book marked as overdue', 'BORROWINGS_SERVICE', {
  borrowingId: borrowing.id,
  bookId: borrowing.bookId,
  borrowerEmail: borrowing.borrowerEmail,
  dueDate: borrowing.dueDate.toISOString(),
  daysOverdue: Math.floor(
    (now.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24)
  ),
});
```

### 4. ERROR Level - Error Events

**Use Case**: Exceptions, failures, errors with stack traces

**Examples from the codebase:**

```typescript
// Service errors
logger.error(
  'Failed to create book',
  error.stack,
  'BOOKS_SERVICE',
  { createBookDto }
);

// Controller errors
logger.error(
  `Failed to retrieve book ${id}`,
  error.stack,
  'BOOKS_CONTROLLER',
  { bookId: id },
);

// HTTP errors (from interceptor)
logger.error(
  `Request failed: ${method} ${url}`,
  error.stack,
  'HTTP_ERROR',
  {
    method,
    url,
    statusCode: error.status || 500,
    responseTime: `${responseTime}ms`,
    errorMessage: error.message,
  },
);
```

### 5. VERBOSE Level - Very Detailed Information

**Use Case**: Low-level details, before/after comparisons, detailed results

**Examples from the codebase:**

```typescript
// Detailed results
logger.verbose(`Retrieved ${books.length} books`, 'BOOKS_SERVICE');
logger.verbose(`Returning ${result.length} books`, 'BOOKS_CONTROLLER', {
  count: result.length,
});

// Before/after state
logger.verbose('Book update details', 'BOOKS_SERVICE', {
  bookId: id,
  before: oldBook,
  after: updatedBook,
});

// Application bootstrap details
logger.verbose('Application bootstrap completed successfully', 'BOOTSTRAP', {
  port,
  timestamp: new Date().toISOString(),
});
```

## Logging Contexts

All logs include a context identifier for easy filtering:

- **BOOTSTRAP** - Application initialization and startup
- **HTTP_REQUEST** - Incoming HTTP requests (from interceptor)
- **HTTP_RESPONSE** - HTTP responses (from interceptor)
- **HTTP_ERROR** - HTTP errors (from interceptor)
- **BOOKS_SERVICE** - Books service operations
- **BOOKS_CONTROLLER** - Books controller operations
- **AUTHORS_SERVICE** - Authors service operations
- **AUTHORS_CONTROLLER** - Authors controller operations
- **BORROWINGS_SERVICE** - Borrowings service operations
- **BORROWINGS_CONTROLLER** - Borrowings controller operations
- **BUSINESS** - Business logic events
- **DATABASE** - Database operations (if applicable)

## Logging Patterns

### Pattern 1: Service Method Logging

```typescript
create(createBookDto: CreateBookDto): Book {
  // Entry log
  this.logger.debug('Creating new book', 'BOOKS_SERVICE', {
    title: createBookDto.title,
    isbn: createBookDto.isbn,
  });

  // Validation/error log
  if (existingBook) {
    this.logger.warn('Attempted to create book with duplicate ISBN', 'BOOKS_SERVICE', {
      isbn: createBookDto.isbn,
      existingBookId: existingBook.id,
    });
    throw new BadRequestException('A book with this ISBN already exists');
  }

  // Success log
  this.logger.info('Book created successfully', 'BOOKS_SERVICE', {
    bookId: book.id,
    title: book.title,
  });

  // Business event log
  this.logger.logBusinessEvent('BOOK_CREATED', {
    bookId: book.id,
    title: book.title,
  });

  return book;
}
```

### Pattern 2: Controller Method Logging

```typescript
create(@Body() createBookDto: CreateBookDto) {
  // Request log
  this.logger.info('POST /books - Creating new book', 'BOOKS_CONTROLLER', {
    title: createBookDto.title,
    isbn: createBookDto.isbn,
  });

  try {
    const book = this.booksService.create(createBookDto);
    
    // Success log
    this.logger.info('Book creation successful', 'BOOKS_CONTROLLER', {
      bookId: book.id,
    });
    
    return book;
  } catch (error) {
    // Error log with stack trace
    this.logger.error(
      'Failed to create book',
      error.stack,
      'BOOKS_CONTROLLER',
      { createBookDto },
    );
    throw error;
  }
}
```

### Pattern 3: HTTP Interceptor Logging

```typescript
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const request = context.switchToHttp().getRequest();
  const { method, url, body, query, params } = request;
  const now = Date.now();

  // Request entry log
  this.logger.debug(`Incoming request: ${method} ${url}`, 'HTTP_REQUEST', {
    method,
    url,
    query,
    params,
    body: method !== 'GET' ? body : undefined,
  });

  return next.handle().pipe(
    tap({
      next: (data) => {
        // Success response log
        const responseTime = Date.now() - now;
        this.logger.logHttpRequest(method, url, response.statusCode, responseTime);
      },
      error: (error) => {
        // Error response log
        const responseTime = Date.now() - now;
        this.logger.error(
          `Request failed: ${method} ${url}`,
          error.stack,
          'HTTP_ERROR',
          {
            method,
            url,
            statusCode: error.status || 500,
            responseTime: `${responseTime}ms`,
            errorMessage: error.message,
          },
        );
      },
    }),
  );
}
```

## Metadata Best Practices

Always include relevant metadata in logs:

```typescript
// Good: Includes relevant context
logger.info('Book created', 'BOOKS_SERVICE', {
  bookId: book.id,
  title: book.title,
  isbn: book.isbn,
  authorId: book.authorId,
});

// Bad: Missing context
logger.info('Book created', 'BOOKS_SERVICE');
```

## Error Logging Best Practices

Always include stack traces and context:

```typescript
// Good: Includes stack trace and context
logger.error(
  'Failed to create book',
  error.stack,
  'BOOKS_SERVICE',
  { createBookDto, bookId: book.id }
);

// Bad: Missing stack trace
logger.error('Failed to create book', undefined, 'BOOKS_SERVICE');
```

## Summary

This application demonstrates comprehensive logging with:
- All log levels (info, debug, warn, error, verbose)
- Contextual logging with clear contexts
- Rich metadata for debugging
- Error logging with stack traces
- HTTP request/response logging
- Business event logging
- Automatic logging via interceptors

The logging implementation provides full observability into the application's behavior, making debugging and monitoring straightforward.

