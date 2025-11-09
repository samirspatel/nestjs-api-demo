import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'Title of the book',
    example: 'The Great Gatsby',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'ISBN number of the book',
    example: '978-0-7432-7356-5',
  })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({
    description: 'ID of the author',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  authorId: number;

  @ApiProperty({
    description: 'Year the book was published',
    example: 1925,
    minimum: 1000,
    maximum: 2100,
  })
  @IsNumber()
  @Min(1000)
  @Max(2100)
  publishedYear: number;

  @ApiProperty({
    description: 'Genre of the book',
    example: 'Fiction',
    required: false,
  })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiProperty({
    description: 'Whether the book is available for borrowing',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

