import { Injectable, NotFoundException } from '@nestjs/common';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class AuthorsService {
  private authors: Author[] = [];
  private nextId = 1;

  constructor(private readonly logger: LoggerService) {
    this.logger.info('AuthorsService initialized', 'AUTHORS_SERVICE');
  }

  create(createAuthorDto: CreateAuthorDto): Author {
    this.logger.debug('Creating new author', 'AUTHORS_SERVICE', {
      firstName: createAuthorDto.firstName,
      lastName: createAuthorDto.lastName,
    });

    const author: Author = {
      id: this.nextId++,
      ...createAuthorDto,
      dateOfBirth: createAuthorDto.dateOfBirth
        ? new Date(createAuthorDto.dateOfBirth)
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.authors.push(author);
    this.logger.info('Author created successfully', 'AUTHORS_SERVICE', {
      authorId: author.id,
      fullName: `${author.firstName} ${author.lastName}`,
    });
    this.logger.logBusinessEvent('AUTHOR_CREATED', {
      authorId: author.id,
      fullName: `${author.firstName} ${author.lastName}`,
    });

    return author;
  }

  findAll(): Author[] {
    this.logger.debug('Fetching all authors', 'AUTHORS_SERVICE', {
      totalAuthors: this.authors.length,
    });
    const authors = this.authors;
    this.logger.verbose(`Retrieved ${authors.length} authors`, 'AUTHORS_SERVICE');
    return authors;
  }

  findOne(id: number): Author {
    this.logger.debug(`Fetching author with ID: ${id}`, 'AUTHORS_SERVICE', {
      authorId: id,
    });
    const author = this.authors.find(author => author.id === id);
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

  update(id: number, updateAuthorDto: UpdateAuthorDto): Author {
    this.logger.debug(`Updating author with ID: ${id}`, 'AUTHORS_SERVICE', {
      authorId: id,
      updates: updateAuthorDto,
    });

    const authorIndex = this.authors.findIndex(author => author.id === id);
    if (authorIndex === -1) {
      this.logger.warn(`Author not found for update: ${id}`, 'AUTHORS_SERVICE', {
        authorId: id,
      });
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    const oldAuthor = { ...this.authors[authorIndex] };

    const updatedAuthor = {
      ...this.authors[authorIndex],
      ...updateAuthorDto,
      dateOfBirth: updateAuthorDto.dateOfBirth
        ? new Date(updateAuthorDto.dateOfBirth)
        : this.authors[authorIndex].dateOfBirth,
      updatedAt: new Date(),
    };

    this.authors[authorIndex] = updatedAuthor;
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

  remove(id: number): void {
    this.logger.debug(`Deleting author with ID: ${id}`, 'AUTHORS_SERVICE', {
      authorId: id,
    });
    const authorIndex = this.authors.findIndex(author => author.id === id);
    if (authorIndex === -1) {
      this.logger.warn(`Author not found for deletion: ${id}`, 'AUTHORS_SERVICE', {
        authorId: id,
      });
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    const deletedAuthor = this.authors[authorIndex];
    this.authors.splice(authorIndex, 1);
    this.logger.info('Author deleted successfully', 'AUTHORS_SERVICE', {
      authorId: id,
      fullName: `${deletedAuthor.firstName} ${deletedAuthor.lastName}`,
    });
    this.logger.logBusinessEvent('AUTHOR_DELETED', {
      authorId: id,
      fullName: `${deletedAuthor.firstName} ${deletedAuthor.lastName}`,
    });
  }
}

