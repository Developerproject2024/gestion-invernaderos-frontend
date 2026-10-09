import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Expense,
  ExpenseCategory,
} from '../../../core/models/expense.model';
import { ExpenseRepository } from '../../repositories/expense.repository';

@Injectable({
  providedIn: 'root',
})
export class GetExpensesUseCase {
  private readonly expenseRepository = inject(
    ExpenseRepository,
  );

  getAll(): Observable<Expense[]> {
    return this.expenseRepository.getAll();
  }

  getCategories(): Observable<ExpenseCategory[]> {
    return this.expenseRepository.getCategories();
  }

  execute(): Observable<Expense[]> {
    return this.getAll();
  }
}