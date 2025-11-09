# NestJS API Demo - Library Management System

A comprehensive NestJS API demo application featuring a library management system with complete Swagger documentation, comprehensive logging using `common-sense-logger`, a full-featured web UI, and PostgreSQL database with TypeORM.

## Features

- **Books Management** - Full CRUD operations for books
- **Authors Management** - Full CRUD operations for authors
- **Borrowing System** - Borrow and return books with automatic availability tracking
- **Swagger Documentation** - Interactive API documentation at `/api`
- **Comprehensive Logging** - Detailed logging throughout the application using `common-sense-logger`
- **PostgreSQL Database** - Persistent data storage with TypeORM
- **Docker Support** - Complete Docker Compose setup with PostgreSQL
- **Web UI** - Full-featured web interface for managing the library
- **Input Validation** - Request validation using class-validator
- **TypeScript** - Fully typed with TypeScript

## Quick Start with Docker

The easiest way to run the application is using Docker Compose. A Makefile is provided for convenience:

```bash
# Build and start all services
make build
make up

# Seed the database with dummy data
make seed

# View logs
make logs-follow
```

Or use Docker Compose directly:

```bash
# Start PostgreSQL and the application
docker-compose up -d

# Seed the database with dummy data
docker-compose exec app npm run seed

# View logs
docker-compose logs -f app
```

The application will be available at:
- **Web UI**: http://localhost:3000
- **Swagger API**: http://localhost:3000/api

### Makefile Commands

The project includes a Makefile with common Docker operations:

- `make build` - Build Docker images
- `make up` - Start all services
- `make down` - Stop all services
- `make restart` - Restart all services
- `make logs` - View application logs
- `make logs-follow` - Follow application logs
- `make shell` - Access app container shell
- `make db-shell` - Access PostgreSQL shell
- `make seed` - Seed the database with dummy data
- `make clean` - Stop and remove containers, networks, volumes
- `make rebuild` - Rebuild and restart all services
- `make ps` - Show running containers

See `make help` for all available commands.

## Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or use Docker Compose)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL** (if not using Docker):
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d postgres
   ```

3. **Set up environment variables** (optional, defaults are provided):
   ```bash
   export DATABASE_HOST=localhost
   export DATABASE_PORT=5432
   export DATABASE_USER=library_user
   export DATABASE_PASSWORD=library_password
   export DATABASE_NAME=library_db
   ```

4. **Start the application:**
   ```bash
   npm run start:dev
   ```

5. **Seed the database** (in a new terminal):
   ```bash
   npm run seed
   ```

## Database Setup

The application uses PostgreSQL with TypeORM. The database schema is automatically synchronized in development mode.

### Seed Data

The seed script populates the database with:
- 8 authors (F. Scott Fitzgerald, Jane Austen, George Orwell, J.K. Rowling, etc.)
- 12 books (The Great Gatsby, 1984, Harry Potter series, etc.)
- 3 sample borrowings (including one overdue book)

Run the seed script:
```bash
npm run seed
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# Access PostgreSQL
docker-compose exec postgres psql -U library_user -d library_db

# Run seed script
docker-compose exec app npm run seed

# Stop and remove volumes (clears database)
docker-compose down -v
```

## Web UI

The application includes a complete web-based user interface accessible at the root URL:

- **Web UI**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000

The web UI provides:
- **Books Management**: View, create, edit, and delete books with filtering by author, genre, and availability
- **Authors Management**: View, create, edit, and delete authors
- **Borrowing System**: Borrow and return books, view borrowing history, and track overdue books
- **Real-time Updates**: All changes are immediately reflected across the interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices

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

## Project Structure

```
src/
├── app.module.ts              # Root module with TypeORM configuration
├── app.controller.ts          # Root controller for serving UI
├── main.ts                    # Application entry point
├── books/                     # Books module
│   ├── books.controller.ts   # Books controller
│   ├── books.service.ts       # Books service with TypeORM
│   ├── books.module.ts
│   ├── dto/                   # Data Transfer Objects
│   └── entities/              # Book entity (TypeORM)
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
├── common/                    # Shared modules
│   ├── logger/                # Logger service
│   └── interceptors/          # HTTP logging interceptor
└── database/                  # Database utilities
    └── seed.ts                # Seed script for dummy data
public/                        # Static files (UI)
├── index.html
├── styles.css
└── app.js
```

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Relational database
- **Swagger/OpenAPI** - API documentation
- **common-sense-logger** - Logging library
- **Docker & Docker Compose** - Containerization
- **class-validator** - Validation decorators
- **class-transformer** - Object transformation
- **TypeScript** - Type-safe JavaScript

## Development

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod

# Run seed script
npm run seed

# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

The following environment variables can be configured:

- `DATABASE_HOST` - PostgreSQL host (default: localhost)
- `DATABASE_PORT` - PostgreSQL port (default: 5432)
- `DATABASE_USER` - PostgreSQL user (default: library_user)
- `DATABASE_PASSWORD` - PostgreSQL password (default: library_password)
- `DATABASE_NAME` - PostgreSQL database name (default: library_db)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port (default: 3000)

## License

MIT
