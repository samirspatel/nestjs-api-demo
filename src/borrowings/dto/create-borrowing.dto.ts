import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsNumber, Min } from 'class-validator';

export class CreateBorrowingDto {
  @ApiProperty({
    description: 'ID of the book to borrow',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  bookId: number;

  @ApiProperty({
    description: 'Name of the borrower',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  borrowerName: string;

  @ApiProperty({
    description: 'Email of the borrower',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  borrowerEmail: string;

  @ApiProperty({
    description: 'Number of days to borrow the book',
    example: 14,
    default: 14,
    required: false,
  })
  @IsNumber()
  @Min(1)
  borrowDays?: number;
}

