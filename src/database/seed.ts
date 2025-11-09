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

export async function seedDatabase(dataSourceInstance?: DataSource) {
  const ds = dataSourceInstance || dataSource;
  const shouldInitialize = !dataSourceInstance;
  
  try {
    if (shouldInitialize) {
      await ds.initialize();
      console.log('Database connection established');
    }

    const authorRepository = ds.getRepository(Author);
    const bookRepository = ds.getRepository(Book);
    const borrowingRepository = ds.getRepository(Borrowing);

    // Check if tables exist before truncating
    const tablesExist = await ds.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('authors', 'books', 'borrowings')
    `);
    
    if (parseInt(tablesExist[0].count) === 3) {
      // Clear existing data using TRUNCATE CASCADE to handle foreign key constraints
      await ds.query('TRUNCATE TABLE borrowings, books, authors RESTART IDENTITY CASCADE');
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
      {
        firstName: 'Mark',
        lastName: 'Twain',
        dateOfBirth: new Date('1835-11-30'),
        nationality: 'American',
        biography: 'Samuel Langhorne Clemens, known by his pen name Mark Twain, was an American writer, humorist, entrepreneur, publisher, and lecturer.',
      },
      {
        firstName: 'Leo',
        lastName: 'Tolstoy',
        dateOfBirth: new Date('1828-09-09'),
        nationality: 'Russian',
        biography: 'Count Lev Nikolayevich Tolstoy, usually referred to in English as Leo Tolstoy, was a Russian writer who is regarded as one of the greatest authors of all time.',
      },
      {
        firstName: 'Virginia',
        lastName: 'Woolf',
        dateOfBirth: new Date('1882-01-25'),
        nationality: 'British',
        biography: 'Adeline Virginia Woolf was an English writer, considered one of the most important modernist 20th-century authors and a pioneer in the use of stream of consciousness.',
      },
      {
        firstName: 'Gabriel',
        lastName: 'García Márquez',
        dateOfBirth: new Date('1927-03-06'),
        nationality: 'Colombian',
        biography: 'Gabriel José de la Concordia García Márquez was a Colombian novelist, short-story writer, screenwriter and journalist.',
      },
      {
        firstName: 'Toni',
        lastName: 'Morrison',
        dateOfBirth: new Date('1931-02-18'),
        nationality: 'American',
        biography: 'Chloe Anthony Wofford Morrison, known as Toni Morrison, was an American novelist, essayist, book editor, and college professor.',
      },
      {
        firstName: 'Isaac',
        lastName: 'Asimov',
        dateOfBirth: new Date('1920-01-02'),
        nationality: 'American',
        biography: 'Isaac Asimov was an American writer and professor of biochemistry at Boston University. He was known for his works of science fiction and popular science.',
      },
      {
        firstName: 'Ray',
        lastName: 'Bradbury',
        dateOfBirth: new Date('1920-08-22'),
        nationality: 'American',
        biography: 'Ray Douglas Bradbury was an American author and screenwriter. One of the most celebrated 20th-century American writers.',
      },
      {
        firstName: 'Maya',
        lastName: 'Angelou',
        dateOfBirth: new Date('1928-04-04'),
        nationality: 'American',
        biography: 'Maya Angelou was an American poet, memoirist, and civil rights activist. She published seven autobiographies, three books of essays, several books of poetry.',
      },
      {
        firstName: 'Kurt',
        lastName: 'Vonnegut',
        dateOfBirth: new Date('1922-11-11'),
        nationality: 'American',
        biography: 'Kurt Vonnegut Jr. was an American writer known for his satirical and darkly humorous novels.',
      },
      {
        firstName: 'Aldous',
        lastName: 'Huxley',
        dateOfBirth: new Date('1894-07-26'),
        nationality: 'British',
        biography: 'Aldous Leonard Huxley was an English writer and philosopher. He wrote nearly 50 books, both novels and non-fiction works.',
      },
      {
        firstName: 'Mary',
        lastName: 'Shelley',
        dateOfBirth: new Date('1797-08-30'),
        nationality: 'British',
        biography: 'Mary Wollstonecraft Shelley was an English novelist who wrote the Gothic novel Frankenstein.',
      },
      {
        firstName: 'Bram',
        lastName: 'Stoker',
        dateOfBirth: new Date('1847-11-08'),
        nationality: 'Irish',
        biography: 'Abraham Stoker was an Irish author, best known today for his 1897 Gothic horror novel Dracula.',
      },
      {
        firstName: 'H.G.',
        lastName: 'Wells',
        dateOfBirth: new Date('1866-09-21'),
        nationality: 'British',
        biography: 'Herbert George Wells was an English writer. Prolific in many genres, he wrote dozens of novels, short stories, and works of social commentary.',
      },
      {
        firstName: 'J.R.R.',
        lastName: 'Tolkien',
        dateOfBirth: new Date('1892-01-03'),
        nationality: 'British',
        biography: 'John Ronald Reuel Tolkien was an English writer, poet, philologist, and academic, best known as the author of the high fantasy works The Hobbit and The Lord of the Rings.',
      },
    ];

    const authors = await authorRepository.save(authorsData);
    console.log(`Created ${authors.length} authors`);

    // Create Books - Expanded list with many classic and popular books
    const booksData = [
      // F. Scott Fitzgerald
      { title: 'The Great Gatsby', isbn: '978-0-7432-7356-5', authorId: authors[0].id, publishedYear: 1925, genre: 'Fiction', available: true },
      { title: 'Tender Is the Night', isbn: '978-0-684-80147-6', authorId: authors[0].id, publishedYear: 1934, genre: 'Fiction', available: true },
      { title: 'This Side of Paradise', isbn: '978-0-684-80148-3', authorId: authors[0].id, publishedYear: 1920, genre: 'Fiction', available: true },
      
      // Jane Austen
      { title: 'Pride and Prejudice', isbn: '978-0-14-143951-8', authorId: authors[1].id, publishedYear: 1813, genre: 'Romance', available: true },
      { title: 'Sense and Sensibility', isbn: '978-0-14-143966-2', authorId: authors[1].id, publishedYear: 1811, genre: 'Romance', available: true },
      { title: 'Emma', isbn: '978-0-14-143958-7', authorId: authors[1].id, publishedYear: 1815, genre: 'Romance', available: true },
      { title: 'Mansfield Park', isbn: '978-0-14-143980-8', authorId: authors[1].id, publishedYear: 1814, genre: 'Romance', available: true },
      { title: 'Persuasion', isbn: '978-0-14-143968-6', authorId: authors[1].id, publishedYear: 1817, genre: 'Romance', available: true },
      
      // George Orwell
      { title: '1984', isbn: '978-0-452-28423-4', authorId: authors[2].id, publishedYear: 1949, genre: 'Dystopian Fiction', available: true },
      { title: 'Animal Farm', isbn: '978-0-452-28424-1', authorId: authors[2].id, publishedYear: 1945, genre: 'Political Satire', available: true },
      { title: 'Homage to Catalonia', isbn: '978-0-15-642117-1', authorId: authors[2].id, publishedYear: 1938, genre: 'Non-Fiction', available: true },
      
      // J.K. Rowling
      { title: 'Harry Potter and the Philosopher\'s Stone', isbn: '978-0-7475-3269-6', authorId: authors[3].id, publishedYear: 1997, genre: 'Fantasy', available: true },
      { title: 'Harry Potter and the Chamber of Secrets', isbn: '978-0-7475-3849-2', authorId: authors[3].id, publishedYear: 1998, genre: 'Fantasy', available: true },
      { title: 'Harry Potter and the Prisoner of Azkaban', isbn: '978-0-7475-4215-5', authorId: authors[3].id, publishedYear: 1999, genre: 'Fantasy', available: true },
      { title: 'Harry Potter and the Goblet of Fire', isbn: '978-0-7475-4624-5', authorId: authors[3].id, publishedYear: 2000, genre: 'Fantasy', available: true },
      { title: 'Harry Potter and the Order of the Phoenix', isbn: '978-0-7475-5100-6', authorId: authors[3].id, publishedYear: 2003, genre: 'Fantasy', available: true },
      { title: 'Harry Potter and the Half-Blood Prince', isbn: '978-0-7475-8108-9', authorId: authors[3].id, publishedYear: 2005, genre: 'Fantasy', available: true },
      { title: 'Harry Potter and the Deathly Hallows', isbn: '978-0-545-01022-1', authorId: authors[3].id, publishedYear: 2007, genre: 'Fantasy', available: true },
      
      // Harper Lee
      { title: 'To Kill a Mockingbird', isbn: '978-0-06-112008-4', authorId: authors[4].id, publishedYear: 1960, genre: 'Fiction', available: true },
      { title: 'Go Set a Watchman', isbn: '978-0-06-240985-0', authorId: authors[4].id, publishedYear: 2015, genre: 'Fiction', available: true },
      
      // Ernest Hemingway
      { title: 'The Old Man and the Sea', isbn: '978-0-684-80122-3', authorId: authors[5].id, publishedYear: 1952, genre: 'Fiction', available: true },
      { title: 'The Catcher in the Rye', isbn: '978-0-316-76948-0', authorId: authors[5].id, publishedYear: 1951, genre: 'Fiction', available: true },
      { title: 'A Farewell to Arms', isbn: '978-0-684-80138-4', authorId: authors[5].id, publishedYear: 1929, genre: 'Fiction', available: true },
      { title: 'For Whom the Bell Tolls', isbn: '978-0-684-80139-1', authorId: authors[5].id, publishedYear: 1940, genre: 'Fiction', available: true },
      { title: 'The Sun Also Rises', isbn: '978-0-684-80140-7', authorId: authors[5].id, publishedYear: 1926, genre: 'Fiction', available: true },
      
      // Agatha Christie
      { title: 'Murder on the Orient Express', isbn: '978-0-06-269366-2', authorId: authors[6].id, publishedYear: 1934, genre: 'Mystery', available: true },
      { title: 'Death on the Nile', isbn: '978-0-06-269367-9', authorId: authors[6].id, publishedYear: 1937, genre: 'Mystery', available: true },
      { title: 'The Murder of Roger Ackroyd', isbn: '978-0-06-269368-6', authorId: authors[6].id, publishedYear: 1926, genre: 'Mystery', available: true },
      { title: 'And Then There Were None', isbn: '978-0-06-269369-3', authorId: authors[6].id, publishedYear: 1939, genre: 'Mystery', available: true },
      { title: 'The ABC Murders', isbn: '978-0-06-269370-9', authorId: authors[6].id, publishedYear: 1936, genre: 'Mystery', available: true },
      { title: 'Curtain', isbn: '978-0-06-269371-6', authorId: authors[6].id, publishedYear: 1975, genre: 'Mystery', available: true },
      
      // Charles Dickens
      { title: 'A Tale of Two Cities', isbn: '978-0-14-143960-0', authorId: authors[7].id, publishedYear: 1859, genre: 'Historical Fiction', available: true },
      { title: 'Great Expectations', isbn: '978-0-14-143956-3', authorId: authors[7].id, publishedYear: 1861, genre: 'Fiction', available: false },
      { title: 'Oliver Twist', isbn: '978-0-14-143974-7', authorId: authors[7].id, publishedYear: 1838, genre: 'Fiction', available: true },
      { title: 'David Copperfield', isbn: '978-0-14-143916-7', authorId: authors[7].id, publishedYear: 1850, genre: 'Fiction', available: true },
      { title: 'A Christmas Carol', isbn: '978-0-14-143947-1', authorId: authors[7].id, publishedYear: 1843, genre: 'Fiction', available: true },
      { title: 'Bleak House', isbn: '978-0-14-143972-3', authorId: authors[7].id, publishedYear: 1853, genre: 'Fiction', available: true },
      
      // Mark Twain
      { title: 'The Adventures of Huckleberry Finn', isbn: '978-0-14-243717-9', authorId: authors[8].id, publishedYear: 1884, genre: 'Fiction', available: true },
      { title: 'The Adventures of Tom Sawyer', isbn: '978-0-14-243717-8', authorId: authors[8].id, publishedYear: 1876, genre: 'Fiction', available: true },
      { title: 'A Connecticut Yankee in King Arthur\'s Court', isbn: '978-0-14-243717-7', authorId: authors[8].id, publishedYear: 1889, genre: 'Fiction', available: true },
      { title: 'The Prince and the Pauper', isbn: '978-0-14-243717-6', authorId: authors[8].id, publishedYear: 1881, genre: 'Fiction', available: true },
      
      // Leo Tolstoy
      { title: 'War and Peace', isbn: '978-0-14-044793-4', authorId: authors[9].id, publishedYear: 1869, genre: 'Historical Fiction', available: true },
      { title: 'Anna Karenina', isbn: '978-0-14-044793-5', authorId: authors[9].id, publishedYear: 1877, genre: 'Fiction', available: true },
      { title: 'The Death of Ivan Ilyich', isbn: '978-0-14-044793-6', authorId: authors[9].id, publishedYear: 1886, genre: 'Fiction', available: true },
      
      // Virginia Woolf
      { title: 'Mrs. Dalloway', isbn: '978-0-15-662870-9', authorId: authors[10].id, publishedYear: 1925, genre: 'Fiction', available: true },
      { title: 'To the Lighthouse', isbn: '978-0-15-690739-2', authorId: authors[10].id, publishedYear: 1927, genre: 'Fiction', available: true },
      { title: 'Orlando', isbn: '978-0-15-670160-8', authorId: authors[10].id, publishedYear: 1928, genre: 'Fiction', available: true },
      { title: 'The Waves', isbn: '978-0-15-694960-6', authorId: authors[10].id, publishedYear: 1931, genre: 'Fiction', available: true },
      
      // Gabriel García Márquez
      { title: 'One Hundred Years of Solitude', isbn: '978-0-06-088328-7', authorId: authors[11].id, publishedYear: 1967, genre: 'Magical Realism', available: true },
      { title: 'Love in the Time of Cholera', isbn: '978-0-14-303907-8', authorId: authors[11].id, publishedYear: 1985, genre: 'Fiction', available: true },
      { title: 'Chronicle of a Death Foretold', isbn: '978-0-14-303715-9', authorId: authors[11].id, publishedYear: 1981, genre: 'Fiction', available: true },
      
      // Toni Morrison
      { title: 'Beloved', isbn: '978-1-4000-3341-6', authorId: authors[12].id, publishedYear: 1987, genre: 'Fiction', available: true },
      { title: 'The Bluest Eye', isbn: '978-0-452-28707-5', authorId: authors[12].id, publishedYear: 1970, genre: 'Fiction', available: true },
      { title: 'Song of Solomon', isbn: '978-1-4000-3342-3', authorId: authors[12].id, publishedYear: 1977, genre: 'Fiction', available: true },
      { title: 'Sula', isbn: '978-1-4000-3343-0', authorId: authors[12].id, publishedYear: 1973, genre: 'Fiction', available: true },
      
      // Isaac Asimov
      { title: 'Foundation', isbn: '978-0-553-29335-7', authorId: authors[13].id, publishedYear: 1951, genre: 'Science Fiction', available: true },
      { title: 'I, Robot', isbn: '978-0-553-29438-5', authorId: authors[13].id, publishedYear: 1950, genre: 'Science Fiction', available: true },
      { title: 'The Caves of Steel', isbn: '978-0-553-29340-1', authorId: authors[13].id, publishedYear: 1954, genre: 'Science Fiction', available: true },
      { title: 'The End of Eternity', isbn: '978-0-553-29341-8', authorId: authors[13].id, publishedYear: 1955, genre: 'Science Fiction', available: true },
      { title: 'The Gods Themselves', isbn: '978-0-553-29342-5', authorId: authors[13].id, publishedYear: 1972, genre: 'Science Fiction', available: true },
      
      // Ray Bradbury
      { title: 'Fahrenheit 451', isbn: '978-0-7432-4722-1', authorId: authors[14].id, publishedYear: 1953, genre: 'Dystopian Fiction', available: true },
      { title: 'The Martian Chronicles', isbn: '978-0-380-97383-9', authorId: authors[14].id, publishedYear: 1950, genre: 'Science Fiction', available: true },
      { title: 'Something Wicked This Way Comes', isbn: '978-0-380-97384-6', authorId: authors[14].id, publishedYear: 1962, genre: 'Horror', available: true },
      { title: 'Dandelion Wine', isbn: '978-0-380-97385-3', authorId: authors[14].id, publishedYear: 1957, genre: 'Fiction', available: true },
      
      // Maya Angelou
      { title: 'I Know Why the Caged Bird Sings', isbn: '978-0-345-44789-7', authorId: authors[15].id, publishedYear: 1969, genre: 'Autobiography', available: true },
      { title: 'Gather Together in My Name', isbn: '978-0-345-44790-3', authorId: authors[15].id, publishedYear: 1974, genre: 'Autobiography', available: true },
      { title: 'The Heart of a Woman', isbn: '978-0-345-44791-0', authorId: authors[15].id, publishedYear: 1981, genre: 'Autobiography', available: true },
      
      // Kurt Vonnegut
      { title: 'Slaughterhouse-Five', isbn: '978-0-385-33384-9', authorId: authors[16].id, publishedYear: 1969, genre: 'Science Fiction', available: true },
      { title: 'Cat\'s Cradle', isbn: '978-0-385-33385-6', authorId: authors[16].id, publishedYear: 1963, genre: 'Science Fiction', available: true },
      { title: 'Breakfast of Champions', isbn: '978-0-385-33386-3', authorId: authors[16].id, publishedYear: 1973, genre: 'Fiction', available: true },
      { title: 'The Sirens of Titan', isbn: '978-0-385-33387-0', authorId: authors[16].id, publishedYear: 1959, genre: 'Science Fiction', available: true },
      
      // Aldous Huxley
      { title: 'Brave New World', isbn: '978-0-06-085052-4', authorId: authors[17].id, publishedYear: 1932, genre: 'Dystopian Fiction', available: true },
      { title: 'The Doors of Perception', isbn: '978-0-06-085053-1', authorId: authors[17].id, publishedYear: 1954, genre: 'Philosophy', available: true },
      { title: 'Island', isbn: '978-0-06-085054-8', authorId: authors[17].id, publishedYear: 1962, genre: 'Fiction', available: true },
      
      // Mary Shelley
      { title: 'Frankenstein', isbn: '978-0-14-143947-2', authorId: authors[18].id, publishedYear: 1818, genre: 'Gothic Fiction', available: true },
      { title: 'The Last Man', isbn: '978-0-14-143948-8', authorId: authors[18].id, publishedYear: 1826, genre: 'Science Fiction', available: true },
      
      // Bram Stoker
      { title: 'Dracula', isbn: '978-0-14-143984-6', authorId: authors[19].id, publishedYear: 1897, genre: 'Gothic Fiction', available: true },
      { title: 'The Jewel of Seven Stars', isbn: '978-0-14-143985-3', authorId: authors[19].id, publishedYear: 1903, genre: 'Horror', available: true },
      
      // H.G. Wells
      { title: 'The Time Machine', isbn: '978-0-14-143997-6', authorId: authors[20].id, publishedYear: 1895, genre: 'Science Fiction', available: true },
      { title: 'The War of the Worlds', isbn: '978-0-14-143998-3', authorId: authors[20].id, publishedYear: 1898, genre: 'Science Fiction', available: true },
      { title: 'The Invisible Man', isbn: '978-0-14-143999-0', authorId: authors[20].id, publishedYear: 1897, genre: 'Science Fiction', available: true },
      { title: 'The Island of Doctor Moreau', isbn: '978-0-14-144000-2', authorId: authors[20].id, publishedYear: 1896, genre: 'Science Fiction', available: true },
      
      // J.R.R. Tolkien
      { title: 'The Hobbit', isbn: '978-0-544-00017-5', authorId: authors[21].id, publishedYear: 1937, genre: 'Fantasy', available: true },
      { title: 'The Fellowship of the Ring', isbn: '978-0-544-00018-2', authorId: authors[21].id, publishedYear: 1954, genre: 'Fantasy', available: true },
      { title: 'The Two Towers', isbn: '978-0-544-00019-9', authorId: authors[21].id, publishedYear: 1954, genre: 'Fantasy', available: true },
      { title: 'The Return of the King', isbn: '978-0-544-00020-5', authorId: authors[21].id, publishedYear: 1955, genre: 'Fantasy', available: true },
      { title: 'The Silmarillion', isbn: '978-0-544-00021-2', authorId: authors[21].id, publishedYear: 1977, genre: 'Fantasy', available: true },
    ];

    const books = await bookRepository.save(booksData);
    console.log(`Created ${books.length} books`);

    // Create some borrowings
    const now = new Date();
    // Helper to format date for PostgreSQL
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    // Helper function to safely find book by title
    const findBookByTitle = (title: string) => {
      const book = books.find(b => b.title === title);
      if (!book) {
        console.warn(`Warning: Book "${title}" not found, skipping borrowing`);
        return null;
      }
      return book.id;
    };

    const borrowingsData = [];
    
    // Great Expectations - already borrowed (overdue)
    const greatExpectationsId = findBookByTitle('Great Expectations');
    if (greatExpectationsId) {
      borrowingsData.push({
        bookId: greatExpectationsId,
        borrowerName: 'John Doe',
        borrowedDate: formatDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)), // 20 days ago
        dueDate: formatDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)), // 6 days ago (overdue)
        status: 'OVERDUE' as const,
      });
    }

    // 1984 - currently borrowed
    const book1984Id = findBookByTitle('1984');
    if (book1984Id) {
      borrowingsData.push({
        bookId: book1984Id,
        borrowerName: 'Jane Smith',
        borrowedDate: formatDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
        dueDate: formatDate(new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000)), // 9 days from now
        status: 'BORROWED' as const,
      });
    }

    // The Great Gatsby - returned
    const greatGatsbyId = findBookByTitle('The Great Gatsby');
    if (greatGatsbyId) {
      borrowingsData.push({
        bookId: greatGatsbyId,
        borrowerName: 'Bob Johnson',
        borrowedDate: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
        dueDate: formatDate(new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000)), // 16 days ago
        returnedDate: formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)), // returned 10 days ago
        status: 'RETURNED' as const,
      });
    }

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

    if (shouldInitialize) {
      await ds.destroy();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    if (shouldInitialize) {
      await ds.destroy();
      process.exit(1);
    }
    throw error;
  }
}

// Only run if this file is executed directly (not imported)
if (require.main === module) {
  seedDatabase();
}

