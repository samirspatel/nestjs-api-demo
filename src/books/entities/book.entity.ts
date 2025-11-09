export class Book {
  id: number;
  title: string;
  isbn: string;
  authorId: number;
  publishedYear: number;
  genre?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

