import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  Expense,
  ExpenseCategory,
} from '../../core/models/expense.model';

import { ExpenseRepository } from '../../domain/repositories/expense.repository';

import {
  MOCK_EXPENSE_CATEGORIES,
  MOCK_EXPENSES,
} from '../data/mock-expenses';

@Injectable({
  providedIn: 'root',
})
export class MockExpenseRepository extends ExpenseRepository {
  private categories: ExpenseCategory[] = [
    ...MOCK_EXPENSE_CATEGORIES,
  ];

  private expenses: Expense[] = [
    ...MOCK_EXPENSES,
  ];

  override getCategories(): Observable<ExpenseCategory[]> {
    return of([...this.categories]);
  }

  override getAll(): Observable<Expense[]> {
    return of([...this.expenses]);
  }

  override getById(id: string): Observable<Expense | null> {
    const expense = this.expenses.find(
      (item) => item.id === id,
    );

    return of(expense ?? null);
  }

  override create(
    expense: Omit<Expense, 'id'>,
  ): Observable<Expense> {
    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      ...expense,
    };

    this.expenses.push(newExpense);

    return of(newExpense);
  }

  override update(expense: Expense): Observable<Expense> {
    const index = this.expenses.findIndex(
      (item) => item.id === expense.id,
    );

    if (index !== -1) {
      this.expenses[index] = expense;
    }

    return of(expense);
  }

  override delete(id: string): Observable<void> {
    this.expenses = this.expenses.filter(
      (item) => item.id !== id,
    );

    return of(void 0);
  }
}