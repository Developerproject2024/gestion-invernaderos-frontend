import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Expense } from '../../../core/models/expense.model';
import { ExpenseRepository } from '../../repositories/expense.repository';

@Injectable({
  providedIn: 'root',
})
export class CreateExpenseUseCase {
  private readonly expenseRepository = inject(
    ExpenseRepository,
  );

  execute(
    expense: Omit<Expense, 'id'>,
  ): Observable<Expense> {
    return this.expenseRepository.create(expense);
  }
}