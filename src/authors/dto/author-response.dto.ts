import { ApiProperty } from '@nestjs/swagger';

export class AuthorResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier for the author' })
  id: number;

  @ApiProperty({ example: 'F. Scott', description: 'First name of the author' })
  firstName: string;

  @ApiProperty({ example: 'Fitzgerald', description: 'Last name of the author' })
  lastName: string;

  @ApiProperty({ example: '1896-09-24', description: 'Date of birth', required: false })
  dateOfBirth?: Date;

  @ApiProperty({ example: 'American', description: 'Nationality', required: false })
  nationality?: string;

  @ApiProperty({ description: 'Biography', required: false })
  biography?: string;

  @ApiProperty({ description: 'Date when the author was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the author was last updated' })
  updatedAt: Date;
}

