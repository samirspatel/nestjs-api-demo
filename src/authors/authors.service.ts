import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    private readonly logger: LoggerService,
  ) {
    this.logger.info('AuthorsService initialized', 'AUTHORS_SERVICE');
  }

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    this.logger.debug('Creating new author', 'AUTHORS_SERVICE', {
      firstName: createAuthorDto.firstName,
      lastName: createAuthorDto.lastName,
    });

    const author = this.authorRepository.create({
      ...createAuthorDto,
      dateOfBirth: createAuthorDto.dateOfBirth
        ? new Date(createAuthorDto.dateOfBirth)
        : undefined,
    });

    const savedAuthor = await this.authorRepository.save(author);
    this.logger.info('Author created successfully', 'AUTHORS_SERVICE', {
      authorId: savedAuthor.id,
      fullName: `${savedAuthor.firstName} ${savedAuthor.lastName}`,
    });
    this.logger.logBusinessEvent('AUTHOR_CREATED', {
      authorId: savedAuthor.id,
      fullName: `${savedAuthor.firstName} ${savedAuthor.lastName}`,
    });

    return savedAuthor;
  }

  async findAll(): Promise<Author[]> {
    const authors = await this.authorRepository.find();
    this.logger.debug('Fetching all authors', 'AUTHORS_SERVICE', {
      totalAuthors: authors.length,
    });
    this.logger.verbose(`Retrieved ${authors.length} authors`, 'AUTHORS_SERVICE');
    return authors;
  }

  async findOne(id: number): Promise<Author> {
    this.logger.debug(`Fetching author with ID: ${id}`, 'AUTHORS_SERVICE', {
      authorId: id,
    });
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      this.logger.warn(`Author not found: ${id}`, 'AUTHORS_SERVICE', {
        authorId: id,
      });
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    this.logger.debug('Author found', 'AUTHORS_SERVICE', {
      authorId: author.id,
      fullName: `${author.firstName} ${author.lastName}`,
    });
    return author;
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    this.logger.debug(`Updating author with ID: ${id}`, 'AUTHORS_SERVICE', {
      authorId: id,
      updates: updateAuthorDto,
    });

    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      this.logger.warn(`Author not found for update: ${id}`, 'AUTHORS_SERVICE', {
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
    this.logger.info('Author updated successfully', 'AUTHORS_SERVICE', {
      authorId: id,
      changes: Object.keys(updateAuthorDto),
    });
    this.logger.logBusinessEvent('AUTHOR_UPDATED', {
      authorId: id,
      fullName: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
      changes: updateAuthorDto,
    });
    this.logger.verbose('Author update details', 'AUTHORS_SERVICE', {
      authorId: id,
      before: oldAuthor,
      after: updatedAuthor,
    });

    return updatedAuthor;
  }

  async remove(id: number): Promise<void> {
    this.logger.debug(`Deleting author with ID: ${id}`, 'AUTHORS_SERVICE', {
      authorId: id,
    });
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      this.logger.warn(`Author not found for deletion: ${id}`, 'AUTHORS_SERVICE', {
        authorId: id,
      });
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    await this.authorRepository.remove(author);
    this.logger.info('Author deleted successfully', 'AUTHORS_SERVICE', {
      authorId: id,
      fullName: `${author.firstName} ${author.lastName}`,
    });
    this.logger.logBusinessEvent('AUTHOR_DELETED', {
      authorId: id,
      fullName: `${author.firstName} ${author.lastName}`,
    });
  }
}

