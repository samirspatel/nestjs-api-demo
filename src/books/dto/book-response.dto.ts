import { ApiProperty } from '@nestjs/swagger';

export class BookResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the book' })
  id: number;

  @ApiProperty({ example: 'The Great Gatsby', description: 'Title of the book' })
  title: string;

  @ApiProperty({ example: '978-0-7432-7356-5', description: 'ISBN number' })
  isbn: string;

  @ApiProperty({ example: 1, description: 'ID of the author' })
  authorId: number;

  @ApiProperty({ example: 1925, description: 'Year the book was published' })
  publishedYear: number;

  @ApiProperty({ example: 'Fiction', description: 'Genre of the book', required: false })
  genre?: string;

  @ApiProperty({ example: true, description: 'Whether the book is available' })
  available: boolean;

  @ApiProperty({ description: 'Date when the book was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the book was last updated' })
  updatedAt: Date;
}

