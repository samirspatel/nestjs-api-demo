import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('AuthorsController initialized', 'AUTHORS_CONTROLLER');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiBody({ type: CreateAuthorDto })
  @ApiResponse({
    status: 201,
    description: 'The author has been successfully created.',
    type: AuthorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input.' })
  async create(@Body() createAuthorDto: CreateAuthorDto) {
    this.logger.info('POST /authors - Creating new author', 'AUTHORS_CONTROLLER', {
      firstName: createAuthorDto.firstName,
      lastName: createAuthorDto.lastName,
    });
    try {
      const author = await this.authorsService.create(createAuthorDto);
      this.logger.info('Author creation successful', 'AUTHORS_CONTROLLER', {
        authorId: author.id,
      });
      return author;
    } catch (error) {
      this.logger.error(
        'Failed to create author',
        error.stack,
        'AUTHORS_CONTROLLER',
        { createAuthorDto },
      );
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all authors' })
  @ApiResponse({
    status: 200,
    description: 'List of all authors',
    type: [AuthorResponseDto],
  })
  async findAll() {
    this.logger.debug('GET /authors - Fetching all authors', 'AUTHORS_CONTROLLER');
    const authors = await this.authorsService.findAll();
    this.logger.verbose(`Returning ${authors.length} authors`, 'AUTHORS_CONTROLLER', {
      count: authors.length,
    });
    return authors;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an author by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({
    status: 200,
    description: 'The author details',
    type: AuthorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  async findOne(@Param('id') id: string) {
    this.logger.debug(`GET /authors/${id} - Fetching author`, 'AUTHORS_CONTROLLER', {
      authorId: id,
    });
    try {
      const author = await this.authorsService.findOne(+id);
      this.logger.verbose('Author retrieved successfully', 'AUTHORS_CONTROLLER', {
        authorId: author.id,
        fullName: `${author.firstName} ${author.lastName}`,
      });
      return author;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve author ${id}`,
        error.stack,
        'AUTHORS_CONTROLLER',
        { authorId: id },
      );
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an author' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiBody({ type: UpdateAuthorDto })
  @ApiResponse({
    status: 200,
    description: 'The author has been successfully updated.',
    type: AuthorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input.' })
  async update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    this.logger.info(`PATCH /authors/${id} - Updating author`, 'AUTHORS_CONTROLLER', {
      authorId: id,
      updates: Object.keys(updateAuthorDto),
    });
    try {
      const author = await this.authorsService.update(+id, updateAuthorDto);
      this.logger.info('Author update successful', 'AUTHORS_CONTROLLER', {
        authorId: author.id,
      });
      return author;
    } catch (error) {
      this.logger.error(
        `Failed to update author ${id}`,
        error.stack,
        'AUTHORS_CONTROLLER',
        { authorId: id, updateAuthorDto },
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an author' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 204, description: 'The author has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  async remove(@Param('id') id: string) {
    this.logger.info(`DELETE /authors/${id} - Deleting author`, 'AUTHORS_CONTROLLER', {
      authorId: id,
    });
    try {
      await this.authorsService.remove(+id);
      this.logger.info('Author deletion successful', 'AUTHORS_CONTROLLER', {
        authorId: id,
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete author ${id}`,
        error.stack,
        'AUTHORS_CONTROLLER',
        { authorId: id },
      );
      throw error;
    }
  }
}

