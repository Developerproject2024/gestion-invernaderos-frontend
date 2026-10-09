export type ExpenseStatus = 'ACTIVE' | 'INACTIVE';

export interface ExpenseCategory {
  id: string;
  name: string;
  status: ExpenseStatus;
}

export interface Expense {
  id: string;
  date: string;
  greenhouseId: string;
  productionCycleId: string;
  expenseCategoryId: string;
  quantity: number;
  value: number;
}