# NestJS API Demo - Library Management System

A comprehensive NestJS API demo application featuring a library management system with complete Swagger documentation and comprehensive logging using `common-sense-logger`.

## Features

- **Books Management** - Full CRUD operations for books
- **Authors Management** - Full CRUD operations for authors
- **Borrowing System** - Borrow and return books with automatic availability tracking
- **Swagger Documentation** - Interactive API documentation at `/api`
- **Comprehensive Logging** - Detailed logging throughout the application using `common-sense-logger`
- **Input Validation** - Request validation using class-validator
- **TypeScript** - Fully typed with TypeScript

## Logging Examples

This application demonstrates comprehensive logging with `common-sense-logger`:

### Log Levels Used

1. **INFO** - General operational messages
   - Application startup
   - Successful operations (create, update, delete)
   - Business events

2. **DEBUG** - Detailed diagnostic information
   - Service method entry/exit
   - Query parameters and filters
   - Data retrieval operations

3. **WARN** - Warning messages
   - Duplicate ISBN attempts
   - Not found resources
   - Overdue books
   - Unavailable book borrowing attempts

4. **ERROR** - Error events
   - Failed operations with stack traces
   - Exception handling
   - Error context and metadata

5. **VERBOSE** - Very detailed information
   - Detailed operation results
   - Before/after state comparisons
   - Low-level operation details

### Logging Contexts

Logs are organized by context for easy filtering:
- `BOOTSTRAP` - Application initialization
- `HTTP_REQUEST` - Incoming HTTP requests
- `HTTP_RESPONSE` - HTTP responses
- `HTTP_ERROR` - HTTP errors
- `BOOKS_SERVICE` - Books service operations
- `BOOKS_CONTROLLER` - Books controller operations
- `AUTHORS_SERVICE` - Authors service operations
- `AUTHORS_CONTROLLER` - Authors controller operations
- `BORROWINGS_SERVICE` - Borrowings service operations
- `BORROWINGS_CONTROLLER` - Borrowings controller operations
- `BUSINESS` - Business logic events
- `DATABASE` - Database operations (if applicable)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Endpoints

### Books

- `GET /books` - Get all books (with optional filters: `?authorId=1`, `?genre=Fiction`, `?available=true`)
- `GET /books/:id` - Get a book by ID
- `POST /books` - Create a new book
- `PATCH /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

### Authors

- `GET /authors` - Get all authors
- `GET /authors/:id` - Get an author by ID
- `POST /authors` - Create a new author
- `PATCH /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author

### Borrowings

- `GET /borrowings` - Get all borrowings (with optional filters: `?borrowerEmail=email@example.com`, `?bookId=1`)
- `GET /borrowings/:id` - Get a borrowing by ID
- `POST /borrowings` - Borrow a book
- `PATCH /borrowings/:id/return` - Return a borrowed book

## Swagger Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000

## Example API Requests

### Create an Author

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "F. Scott",
    "lastName": "Fitzgerald",
    "dateOfBirth": "1896-09-24",
    "nationality": "American",
    "biography": "Francis Scott Key Fitzgerald was an American novelist..."
  }'
```

### Create a Book

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "isbn": "978-0-7432-7356-5",
    "authorId": 1,
    "publishedYear": 1925,
    "genre": "Fiction",
    "available": true
  }'
```

### Borrow a Book

```bash
curl -X POST http://localhost:3000/borrowings \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": 1,
    "borrowerName": "John Doe",
    "borrowerEmail": "john.doe@example.com",
    "borrowDays": 14
  }'
```

### Return a Book

```bash
curl -X PATCH http://localhost:3000/borrowings/1/return
```

## Logging Examples in Code

### Service Layer Logging

```typescript
// Info log for successful operations
this.logger.info('Book created successfully', 'BOOKS_SERVICE', {
  bookId: book.id,
  title: book.title,
});

// Debug log for detailed operations
this.logger.debug('Fetching book with ID: ${id}', 'BOOKS_SERVICE', { bookId: id });

// Warn log for potential issues
this.logger.warn('Book not found: ${id}', 'BOOKS_SERVICE', { bookId: id });

// Error log with stack trace
this.logger.error(
  'Failed to create book',
  error.stack,
  'BOOKS_SERVICE',
  { createBookDto }
);
```

### Controller Layer Logging

```typescript
// Log incoming requests
this.logger.info('POST /books - Creating new book', 'BOOKS_CONTROLLER', {
  title: createBookDto.title,
  isbn: createBookDto.isbn,
});

// Log successful responses
this.logger.info('Book creation successful', 'BOOKS_CONTROLLER', {
  bookId: book.id,
});
```

### Business Event Logging

```typescript
// Log business events
this.logger.logBusinessEvent('BOOK_CREATED', {
  bookId: book.id,
  title: book.title,
});
```

### HTTP Request/Response Logging

The application includes a global `LoggingInterceptor` that automatically logs:
- Incoming HTTP requests (method, URL, query params, body)
- Response times
- Response status codes
- Errors with stack traces

## Project Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point with Swagger setup
├── books/                     # Books module
│   ├── books.controller.ts   # Books controller with Swagger decorators
│   ├── books.service.ts       # Books service with logging
│   ├── books.module.ts
│   ├── dto/                   # Data Transfer Objects
│   └── entities/              # Book entity
├── authors/                   # Authors module
│   ├── authors.controller.ts
│   ├── authors.service.ts
│   ├── authors.module.ts
│   ├── dto/
│   └── entities/
├── borrowings/               # Borrowings module
│   ├── borrowings.controller.ts
│   ├── borrowings.service.ts
│   ├── borrowings.module.ts
│   ├── dto/
│   └── entities/
└── common/                    # Shared modules
    ├── logger/                # Logger service and module
    │   ├── logger.service.ts
    │   └── logger.module.ts
    └── interceptors/          # Global interceptors
        └── logging.interceptor.ts
```

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **Swagger/OpenAPI** - API documentation
- **common-sense-logger** - Logging library
- **class-validator** - Validation decorators
- **class-transformer** - Object transformation
- **TypeScript** - Type-safe JavaScript

## Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod
```

## License

MIT

