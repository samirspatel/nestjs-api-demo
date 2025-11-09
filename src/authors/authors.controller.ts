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
  Inject,
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
import { Logger } from 'common-sense-logger';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
    @Inject('LOGGER')
    private readonly logger: Logger,
  ) {
    this.logger.info('[AUTHORS_CONTROLLER] AuthorsController initialized');
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
    this.logger.info('[AUTHORS_CONTROLLER] POST /authors - Creating new author', {
      firstName: createAuthorDto.firstName,
      lastName: createAuthorDto.lastName,
    });
    try {
      const author = await this.authorsService.create(createAuthorDto);
      this.logger.info('[AUTHORS_CONTROLLER] Author creation successful', {
        authorId: author.id,
      });
      return author;
    } catch (error) {
      this.logger.error('[AUTHORS_CONTROLLER] Failed to create author', {
        createAuthorDto,
        stack: error.stack,
      });
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
    this.logger.debug('[AUTHORS_CONTROLLER] GET /authors - Fetching all authors');
    const authors = await this.authorsService.findAll();
    this.logger.debug(`[AUTHORS_CONTROLLER] Returning ${authors.length} authors`, {
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
    this.logger.debug(`[AUTHORS_CONTROLLER] GET /authors/${id} - Fetching author`, {
      authorId: id,
    });
    try {
      const author = await this.authorsService.findOne(+id);
      this.logger.debug('[AUTHORS_CONTROLLER] Author retrieved successfully', {
        authorId: author.id,
        fullName: `${author.firstName} ${author.lastName}`,
      });
      return author;
    } catch (error) {
      this.logger.error(`[AUTHORS_CONTROLLER] Failed to retrieve author ${id}`, {
        authorId: id,
        stack: error.stack,
      });
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
    this.logger.info(`[AUTHORS_CONTROLLER] PATCH /authors/${id} - Updating author`, {
      authorId: id,
      updates: Object.keys(updateAuthorDto),
    });
    try {
      const author = await this.authorsService.update(+id, updateAuthorDto);
      this.logger.info('[AUTHORS_CONTROLLER] Author update successful', {
        authorId: author.id,
      });
      return author;
    } catch (error) {
      this.logger.error(`[AUTHORS_CONTROLLER] Failed to update author ${id}`, {
        authorId: id,
        updateAuthorDto,
        stack: error.stack,
      });
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
    this.logger.info(`[AUTHORS_CONTROLLER] DELETE /authors/${id} - Deleting author`, {
      authorId: id,
    });
    try {
      await this.authorsService.remove(+id);
      this.logger.info('[AUTHORS_CONTROLLER] Author deletion successful', {
        authorId: id,
      });
    } catch (error) {
      this.logger.error(`[AUTHORS_CONTROLLER] Failed to delete author ${id}`, {
        authorId: id,
        stack: error.stack,
      });
      throw error;
    }
  }
}
