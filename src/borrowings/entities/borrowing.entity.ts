import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity('borrowings')
export class Borrowing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookId: number;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column()
  borrowerName: string;

  @Column({ type: 'date' })
  borrowedDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  returnedDate?: Date;

  @Column({
    type: 'enum',
    enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
    default: 'BORROWED',
  })
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

