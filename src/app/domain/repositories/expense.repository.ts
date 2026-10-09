import { Observable } from 'rxjs';

import {
  Expense,
  ExpenseCategory,
} from '../../core/models/expense.model';

export abstract class ExpenseRepository {
  abstract getCategories(): Observable<ExpenseCategory[]>;

  abstract getAll(): Observable<Expense[]>;

  abstract getById(id: string): Observable<Expense | null>;

  abstract create(
    expense: Omit<Expense, 'id'>,
  ): Observable<Expense>;

  abstract update(expense: Expense): Observable<Expense>;

  abstract delete(id: string): Observable<void>;
}