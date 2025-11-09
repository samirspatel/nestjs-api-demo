import { DataSource } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { Borrowing } from '../borrowings/entities/borrowing.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'library_user',
  password: process.env.DATABASE_PASSWORD || 'library_password',
  database: process.env.DATABASE_NAME || 'library_db',
  entities: [Book, Author, Borrowing],
  synchronize: false,
});

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const authorRepository = dataSource.getRepository(Author);
    const bookRepository = dataSource.getRepository(Book);
    const borrowingRepository = dataSource.getRepository(Borrowing);

    // Check if tables exist before truncating
    const tablesExist = await dataSource.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('authors', 'books', 'borrowings')
    `);
    
    if (parseInt(tablesExist[0].count) === 3) {
      // Clear existing data using TRUNCATE CASCADE to handle foreign key constraints
      await dataSource.query('TRUNCATE TABLE borrowings, books, authors RESTART IDENTITY CASCADE');
      console.log('Cleared existing data');
    } else {
      console.log('Tables do not exist yet, skipping truncate (schema will be created by synchronize)');
    }

    // Create Authors
    const authorsData = [
      {
        firstName: 'F. Scott',
        lastName: 'Fitzgerald',
        dateOfBirth: new Date('1896-09-24'),
        nationality: 'American',
        biography: 'Francis Scott Key Fitzgerald was an American novelist, essayist, and short story writer. He is best known for his novel The Great Gatsby.',
      },
      {
        firstName: 'Jane',
        lastName: 'Austen',
        dateOfBirth: new Date('1775-12-16'),
        nationality: 'British',
        biography: 'Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century.',
      },
      {
        firstName: 'George',
        lastName: 'Orwell',
        dateOfBirth: new Date('1903-06-25'),
        nationality: 'British',
        biography: 'Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist and critic.',
      },
      {
        firstName: 'J.K.',
        lastName: 'Rowling',
        dateOfBirth: new Date('1965-07-31'),
        nationality: 'British',
        biography: 'Joanne Rowling, better known by her pen name J. K. Rowling, is a British author and philanthropist. She wrote Harry Potter, a seven-volume children\'s fantasy series.',
      },
      {
        firstName: 'Harper',
        lastName: 'Lee',
        dateOfBirth: new Date('1926-04-28'),
        nationality: 'American',
        biography: 'Nelle Harper Lee was an American novelist best known for her 1960 novel To Kill a Mockingbird.',
      },
      {
        firstName: 'Ernest',
        lastName: 'Hemingway',
        dateOfBirth: new Date('1899-07-21'),
        nationality: 'American',
        biography: 'Ernest Miller Hemingway was an American novelist, short-story writer, and journalist. His economical and understated style had a strong influence on 20th-century fiction.',
      },
      {
        firstName: 'Agatha',
        lastName: 'Christie',
        dateOfBirth: new Date('1890-09-15'),
        nationality: 'British',
        biography: 'Dame Agatha Mary Clarissa Christie was an English writer known for her 66 detective novels and 14 short story collections.',
      },
      {
        firstName: 'Charles',
        lastName: 'Dickens',
        dateOfBirth: new Date('1812-02-07'),
        nationality: 'British',
        biography: 'Charles John Huffam Dickens was an English writer and social critic. He created some of the world\'s best-known fictional characters.',
      },
    ];

    const authors = await authorRepository.save(authorsData);
    console.log(`Created ${authors.length} authors`);

    // Create Books
    const booksData = [
      {
        title: 'The Great Gatsby',
        isbn: '978-0-7432-7356-5',
        authorId: authors[0].id,
        publishedYear: 1925,
        genre: 'Fiction',
        available: true,
      },
      {
        title: 'Pride and Prejudice',
        isbn: '978-0-14-143951-8',
        authorId: authors[1].id,
        publishedYear: 1813,
        genre: 'Romance',
        available: true,
      },
      {
        title: '1984',
        isbn: '978-0-452-28423-4',
        authorId: authors[2].id,
        publishedYear: 1949,
        genre: 'Dystopian Fiction',
        available: true,
      },
      {
        title: 'Animal Farm',
        isbn: '978-0-452-28424-1',
        authorId: authors[2].id,
        publishedYear: 1945,
        genre: 'Political Satire',
        available: true,
      },
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        isbn: '978-0-7475-3269-6',
        authorId: authors[3].id,
        publishedYear: 1997,
        genre: 'Fantasy',
        available: true,
      },
      {
        title: 'Harry Potter and the Chamber of Secrets',
        isbn: '978-0-7475-3849-2',
        authorId: authors[3].id,
        publishedYear: 1998,
        genre: 'Fantasy',
        available: true,
      },
      {
        title: 'To Kill a Mockingbird',
        isbn: '978-0-06-112008-4',
        authorId: authors[4].id,
        publishedYear: 1960,
        genre: 'Fiction',
        available: true,
      },
      {
        title: 'The Old Man and the Sea',
        isbn: '978-0-684-80122-3',
        authorId: authors[5].id,
        publishedYear: 1952,
        genre: 'Fiction',
        available: true,
      },
      {
        title: 'Murder on the Orient Express',
        isbn: '978-0-06-269366-2',
        authorId: authors[6].id,
        publishedYear: 1934,
        genre: 'Mystery',
        available: true,
      },
      {
        title: 'A Tale of Two Cities',
        isbn: '978-0-14-143960-0',
        authorId: authors[7].id,
        publishedYear: 1859,
        genre: 'Historical Fiction',
        available: true,
      },
      {
        title: 'Great Expectations',
        isbn: '978-0-14-143956-3',
        authorId: authors[7].id,
        publishedYear: 1861,
        genre: 'Fiction',
        available: false,
      },
      {
        title: 'The Catcher in the Rye',
        isbn: '978-0-316-76948-0',
        authorId: authors[5].id,
        publishedYear: 1951,
        genre: 'Fiction',
        available: true,
      },
    ];

    const books = await bookRepository.save(booksData);
    console.log(`Created ${books.length} books`);

    // Create some borrowings
    const now = new Date();
    // Helper to format date for PostgreSQL
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const borrowingsData = [
      {
        bookId: books[10].id, // Great Expectations - already borrowed
        borrowerName: 'John Doe',
        borrowerEmail: 'john.doe@example.com',
        borrowedDate: formatDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)), // 20 days ago
        dueDate: formatDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)), // 6 days ago (overdue)
        status: 'OVERDUE' as const,
      },
      {
        bookId: books[2].id, // 1984
        borrowerName: 'Jane Smith',
        borrowerEmail: 'jane.smith@example.com',
        borrowedDate: formatDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
        dueDate: formatDate(new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000)), // 9 days from now
        status: 'BORROWED' as const,
      },
      {
        bookId: books[0].id, // The Great Gatsby
        borrowerName: 'Bob Johnson',
        borrowerEmail: 'bob.johnson@example.com',
        borrowedDate: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
        dueDate: formatDate(new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000)), // 16 days ago
        returnedDate: formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)), // returned 10 days ago
        status: 'RETURNED' as const,
      },
    ];

    const borrowings = await borrowingRepository.save(borrowingsData);
    console.log(`Created ${borrowings.length} borrowings`);

    // Update book availability based on borrowings
    const borrowedBookIds = borrowings
      .filter(b => b.status === 'BORROWED' || b.status === 'OVERDUE')
      .map(b => b.bookId);
    
    if (borrowedBookIds.length > 0) {
      await bookRepository
        .createQueryBuilder()
        .update(Book)
        .set({ available: false })
        .where('id IN (:...ids)', { ids: borrowedBookIds })
        .execute();
    }

    console.log('Seed data created successfully!');
    console.log(`\nSummary:`);
    console.log(`- Authors: ${authors.length}`);
    console.log(`- Books: ${books.length}`);
    console.log(`- Borrowings: ${borrowings.length}`);
    console.log(`- Available books: ${books.length - borrowedBookIds.length}`);
    console.log(`- Borrowed books: ${borrowedBookIds.length}`);

    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();

