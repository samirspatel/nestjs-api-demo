import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';
import { Book } from '../books/entities/book.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Logger } from 'common-sense-logger';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @Inject('LOGGER')
    private readonly logger: Logger,
  ) {
    this.logger.info('[AUTHORS_SERVICE] AuthorsService initialized');
  }

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    this.logger.debug('[AUTHORS_SERVICE] Creating new author', {
      firstName: createAuthorDto.firstName,
      lastName: createAuthorDto.lastName,
    });

    const author = this.authorRepository.create({
      ...createAuthorDto,
      dateOfBirth: createAuthorDto.dateOfBirth ? new Date(createAuthorDto.dateOfBirth) : undefined,
    });

    const savedAuthor = await this.authorRepository.save(author);
    this.logger.info('[AUTHORS_SERVICE] Author created successfully', {
      authorId: savedAuthor.id,
      fullName: `${savedAuthor.firstName} ${savedAuthor.lastName}`,
    });
    this.logger.info('[BUSINESS_EVENT] AUTHOR_CREATED', {
      authorId: savedAuthor.id,
      fullName: `${savedAuthor.firstName} ${savedAuthor.lastName}`,
    });

    return savedAuthor;
  }

  async findAll(): Promise<Author[]> {
    const authors = await this.authorRepository.find();
    this.logger.debug('[AUTHORS_SERVICE] Fetching all authors', {
      totalAuthors: authors.length,
    });
    this.logger.debug(`[AUTHORS_SERVICE] Retrieved ${authors.length} authors`);
    return authors;
  }

  async findOne(id: number): Promise<Author> {
    this.logger.debug(`[AUTHORS_SERVICE] Fetching author with ID: ${id}`, {
      authorId: id,
    });
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      this.logger.warn(`[AUTHORS_SERVICE] Author not found: ${id}`, {
        authorId: id,
      });
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    this.logger.debug('[AUTHORS_SERVICE] Author found', {
      authorId: author.id,
      fullName: `${author.firstName} ${author.lastName}`,
    });
    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    this.logger.debug(`[AUTHORS_SERVICE] Updating author with ID: ${id}`, {
      authorId: id,
      updates: updateAuthorDto,
    });

    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      this.logger.warn(`[AUTHORS_SERVICE] Author not found for update: ${id}`, {
        authorId: id,
      });
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    const oldAuthor = { ...author };

    Object.assign(author, {
      ...updateAuthorDto,
      dateOfBirth: updateAuthorDto.dateOfBirth
        ? new Date(updateAuthorDto.dateOfBirth)
        : author.dateOfBirth,
    });

    const updatedAuthor = await this.authorRepository.save(author);
    this.logger.info('[AUTHORS_SERVICE] Author updated successfully', {
      authorId: id,
      changes: Object.keys(updateAuthorDto),
    });
    this.logger.info('[BUSINESS_EVENT] AUTHOR_UPDATED', {
      authorId: id,
      fullName: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
      changes: updateAuthorDto,
    });
    this.logger.debug('[AUTHORS_SERVICE] Author update details', {
      authorId: id,
      before: oldAuthor,
      after: updatedAuthor,
    });

    return updatedAuthor;
  }

  async remove(id: number): Promise<void> {
    this.logger.debug(`[AUTHORS_SERVICE] Deleting author with ID: ${id}`, {
      authorId: id,
    });
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      this.logger.warn(`[AUTHORS_SERVICE] Author not found for deletion: ${id}`, {
        authorId: id,
      });
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    const bookCount = await this.bookRepository.count({ where: { authorId: id } });
    if (bookCount > 0) {
      this.logger.warn(`[AUTHORS_SERVICE] Cannot delete author with books: ${id}`, {
        authorId: id,
        bookCount,
      });
      throw new BadRequestException(
        `Cannot delete author with ID ${id}. This author has ${bookCount} book(s) associated. Please delete or reassign the books first.`,
      );
    }

    await this.authorRepository.remove(author);
    this.logger.info('[AUTHORS_SERVICE] Author deleted successfully', {
      authorId: id,
      fullName: `${author.firstName} ${author.lastName}`,
    });
    this.logger.info('[BUSINESS_EVENT] AUTHOR_DELETED', {
      authorId: id,
      fullName: `${author.firstName} ${author.lastName}`,
    });
  }
}
