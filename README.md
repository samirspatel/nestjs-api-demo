# Library Management System

A modern, full-stack library management application built with NestJS. Manage books, authors, and track book borrowings through a beautiful web interface or RESTful API.

![Library Management System](https://img.shields.io/badge/NestJS-8.0-red) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-green)

## What is This?

A complete library management system that allows you to:

- 📚 **Manage Books** - Add, edit, and delete books with details like ISBN, genre, publication year, and author
- 👤 **Manage Authors** - Keep track of authors with their biographical information
- 📖 **Track Borrowings** - Borrow books, track due dates, and automatically manage availability
- 🎨 **Beautiful Web UI** - Modern, Airbnb-inspired interface for easy management
- 📡 **RESTful API** - Full-featured API with interactive Swagger documentation

Perfect for learning NestJS, TypeORM, and modern web development patterns, or as a starting point for your own library management needs.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Make (optional, for convenience commands)

### Get Started in 3 Steps

1. **Start the application:**
   ```bash
   make up
   ```
   This will:
   - Build and start PostgreSQL and the NestJS app
   - Wait for the database to be ready
   - Automatically create the database schema
   - Seed the database with sample data
   - Enable hot reload for development

2. **Access the application:**
   - **Web UI**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api

3. **That's it!** The system is fully bootstrapped and ready to use.

The `make up` command will tail logs so you can see everything happening. Press `Ctrl+C` to stop viewing logs (services will continue running).

## Features

### Core Functionality

- **Books Management**
  - Full CRUD operations (Create, Read, Update, Delete)
  - Filter by author, genre, and availability
  - Search by title, author, or ISBN
  - Automatic book cover images from Open Library API
  - Beautiful card-based UI with placeholder images

- **Authors Management**
  - Full CRUD operations
  - Track author details (name, nationality, date of birth)
  - View books by each author
  - Avatar placeholders with initials

- **Borrowing System**
  - Borrow books with borrower email and due date
  - Return books automatically
  - Track overdue books with visual indicators
  - Automatic availability management

### Technical Features

- **Modern Stack**
  - NestJS with TypeScript
  - PostgreSQL with TypeORM
  - Docker Compose for easy deployment
  - Hot reload for development

- **Developer Experience**
  - Interactive Swagger API documentation
  - Comprehensive logging with `common-sense-logger`
  - Input validation with class-validator
  - Type-safe code throughout

- **User Experience**
  - Clean, modern UI inspired by Airbnb
  - Responsive design
  - Real-time updates
  - Intuitive navigation

## Available Commands

### Using Make (Recommended)

```bash
make up          # Start all services with auto-bootstrap
make down        # Stop all services
make restart     # Restart all services
make logs        # View application logs
make logs-follow # Follow application logs (live)
make seed        # Re-seed the database
make shell       # Access app container shell
make db-shell    # Access PostgreSQL shell
make clean       # Stop and remove everything (including volumes)
make rebuild     # Rebuild and restart all services
make ps          # Show running containers
make help        # Show all available commands
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access PostgreSQL
docker-compose exec postgres psql -U library_user -d library_db

# Run seed script
docker-compose exec app npm run seed
```

### Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Start PostgreSQL (or use Docker)
docker-compose up -d postgres

# Set environment variables (optional)
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_USER=library_user
export DATABASE_PASSWORD=library_password
export DATABASE_NAME=library_db

# Start the application
npm run start:dev

# Seed the database (in another terminal)
npm run seed
```

## API Documentation

Once the application is running, visit **http://localhost:3000/api** for interactive Swagger documentation.

### Main Endpoints

**Books**
- `GET /books` - List all books (supports `?authorId`, `?genre`, `?available` filters)
- `GET /books/:id` - Get a specific book
- `POST /books` - Create a new book
- `PATCH /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

**Authors**
- `GET /authors` - List all authors
- `GET /authors/:id` - Get a specific author
- `POST /authors` - Create a new author
- `PATCH /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author

**Borrowings**
- `GET /borrowings` - List all borrowings (supports `?bookId` filter)
- `GET /borrowings/:id` - Get a specific borrowing
- `POST /borrowings` - Borrow a book
- `PATCH /borrowings/:id/return` - Return a borrowed book

## Project Structure

```
src/
├── app.module.ts              # Root module
├── app.controller.ts          # Serves the web UI
├── main.ts                    # Application entry point
├── books/                     # Books feature module
│   ├── books.controller.ts   # REST endpoints
│   ├── books.service.ts       # Business logic
│   ├── books.module.ts
│   ├── dto/                   # Request/Response DTOs
│   └── entities/              # TypeORM entities
├── authors/                   # Authors feature module
├── borrowings/               # Borrowings feature module
├── common/                    # Shared modules
│   ├── logger/                # Logging service
│   └── interceptors/          # HTTP logging
└── database/
    └── seed.ts                # Database seeding script

public/                        # Frontend files
├── index.html                 # Main HTML
├── styles.css                 # Styles
└── app.js                     # Frontend JavaScript
```

## Sample Data

The seed script includes:

- **8 Authors**: F. Scott Fitzgerald, Jane Austen, George Orwell, J.K. Rowling, Harper Lee, Ernest Hemingway, Agatha Christie, Charles Dickens
- **12 Books**: Classic literature including The Great Gatsby, 1984, Harry Potter series, To Kill a Mockingbird, and more
- **3 Borrowings**: Sample borrowing records including one overdue book

## Technologies

- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: PostgreSQL 15
- **API Docs**: Swagger/OpenAPI
- **Logging**: common-sense-logger
- **Validation**: class-validator, class-transformer
- **Containerization**: Docker, Docker Compose
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Environment Variables

Default values are provided, but you can override:

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=library_user
DATABASE_PASSWORD=library_password
DATABASE_NAME=library_db
PORT=3000
NODE_ENV=development
```

## Development

```bash
# Development mode (hot reload)
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod

# Code quality
npm run lint
npm run format
```

## Troubleshooting

**Database connection issues:**
- Ensure PostgreSQL is running: `docker-compose ps`
- Check logs: `make logs` or `docker-compose logs postgres`

**Port already in use:**
- Change `PORT` in `docker-compose.yml` or environment variables

**Seed script fails:**
- Ensure database is ready: `make db-shell` to test connection
- Check that tables exist: `\dt` in PostgreSQL shell

**Hot reload not working:**
- Ensure volumes are mounted correctly in `docker-compose.yml`
- Try `make rebuild` to restart with fresh build

## License

MIT
