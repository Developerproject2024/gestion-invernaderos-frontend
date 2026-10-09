import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ExpenseRepository } from '../../repositories/expense.repository';

@Injectable({
  providedIn: 'root',
})
export class DeleteExpenseUseCase {
  private readonly expenseRepository = inject(
    ExpenseRepository,
  );

  execute(id: string): Observable<void> {
    return this.expenseRepository.delete(id);
  }
}