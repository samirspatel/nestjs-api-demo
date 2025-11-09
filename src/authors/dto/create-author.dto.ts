import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'First name of the author',
    example: 'F. Scott',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the author',
    example: 'Fitzgerald',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Date of birth of the author',
    example: '1896-09-24',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Nationality of the author',
    example: 'American',
    required: false,
  })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({
    description: 'Biography of the author',
    example: 'Francis Scott Key Fitzgerald was an American novelist...',
    required: false,
  })
  @IsString()
  @IsOptional()
  biography?: string;
}

