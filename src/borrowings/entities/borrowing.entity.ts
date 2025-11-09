export class Borrowing {
  id: number;
  bookId: number;
  borrowerName: string;
  borrowerEmail: string;
  borrowedDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  createdAt: Date;
  updatedAt: Date;
}

