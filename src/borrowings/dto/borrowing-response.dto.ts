import { ApiProperty } from '@nestjs/swagger';

export class BorrowingResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the borrowing' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the borrowed book' })
  bookId: number;

  @ApiProperty({ example: 'John Doe', description: 'Name of the borrower' })
  borrowerName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email of the borrower' })
  borrowerEmail: string;

  @ApiProperty({ description: 'Date when the book was borrowed' })
  borrowedDate: Date;

  @ApiProperty({ description: 'Date when the book is due to be returned' })
  dueDate: Date;

  @ApiProperty({ description: 'Date when the book was returned', required: false })
  returnedDate?: Date;

  @ApiProperty({
    example: 'BORROWED',
    enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
    description: 'Status of the borrowing',
  })
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';

  @ApiProperty({ description: 'Date when the borrowing record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the borrowing record was last updated' })
  updatedAt: Date;
}

