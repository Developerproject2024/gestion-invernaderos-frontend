import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  Expense,
  ExpenseCategory,
} from '../../../core/models/expense.model';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { ProductionCycle } from '../../../core/models/production-cycle.model';
import { GreenhouseAccessService } from '../../../core/auth/greenhouse-access.service';

import { DeleteExpenseUseCase } from '../../../domain/use-cases/expense/delete-expense.use-case';
import { GetExpensesUseCase } from '../../../domain/use-cases/expense/get-expenses.use-case';
import { GetGreenhousesUseCase } from '../../../domain/use-cases/greenhouse/get-greenhouses.use-case';
import { GetProductionCyclesUseCase } from '../../../domain/use-cases/production-cycle/get-production-cycles.use-case';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableComponent } from '../../../shared/components/table/table.component';

import { ExpenseFormComponent } from '../expense-form/expense-form.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    FormsModule,
    ModalComponent,
    TableComponent,
    ExpenseFormComponent,
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
})
export class ExpenseListComponent implements OnInit {
  private readonly getExpensesUseCase =
    inject(GetExpensesUseCase);

  private readonly deleteExpenseUseCase =
    inject(DeleteExpenseUseCase);

  private readonly getGreenhousesUseCase =
    inject(GetGreenhousesUseCase);

  private readonly getProductionCyclesUseCase =
    inject(GetProductionCyclesUseCase);

  private readonly greenhouseAccessService =
    inject(GreenhouseAccessService);

  readonly expenses = signal<Expense[]>([]);

  readonly categories =
    signal<ExpenseCategory[]>([]);

  readonly greenhouses =
    signal<Greenhouse[]>([]);

  readonly productionCycles =
    signal<ProductionCycle[]>([]);

  readonly showForm = signal(false);

  readonly showDeleteModal =
    signal(false);

  readonly selectedExpense =
    signal<Expense | null>(null);

  readonly expenseToDelete =
    signal<Expense | null>(null);

  readonly greenhouseFilter = signal('');

  readonly cycleFilter = signal('');

  readonly categoryFilter = signal('');

  readonly startDateFilter = signal('');

  readonly endDateFilter = signal('');

  readonly availableCycles = computed(() => {
    const greenhouseId = this.greenhouseFilter();

    return this.productionCycles().filter(
      (cycle) => !greenhouseId || cycle.greenhouseId === greenhouseId,
    );
  });

  readonly filteredExpenses = computed(() => {
    const greenhouseId = this.greenhouseFilter();
    const cycleId = this.cycleFilter();
    const categoryId = this.categoryFilter();
    const startDate = this.startDateFilter();
    const endDate = this.endDateFilter();

    return this.expenses().filter((expense) =>
      (!greenhouseId || expense.greenhouseId === greenhouseId) &&
      (!cycleId || expense.productionCycleId === cycleId) &&
      (!categoryId || expense.expenseCategoryId === categoryId) &&
      (!startDate || expense.date >= startDate) &&
      (!endDate || expense.date <= endDate),
    );
  });

  readonly currentPage = signal(1);

  readonly pageSize = 10;

  readonly totalPages = computed(() => {
    const totalItems = this.filteredExpenses().length;

    return Math.max(
      1,
      Math.ceil(totalItems / this.pageSize),
    );
  });

  readonly paginatedExpenses = computed(() => {
    const startIndex =
      (this.currentPage() - 1) *
      this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    return this.filteredExpenses().slice(
      startIndex,
      endIndex,
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.currentPage.set(1);

    forkJoin({
      expenses: this.getExpensesUseCase.getAll(),
      categories: this.getExpensesUseCase.getCategories(),
      greenhouses: this.getGreenhousesUseCase.execute(),
      cycles: this.getProductionCyclesUseCase.execute(),
    }).subscribe({
      next: ({ expenses, categories, greenhouses, cycles }) => {
        const accessibleGreenhouses =
          this.greenhouseAccessService.filterForCurrentUser(greenhouses);
        const accessibleGreenhouseIds = new Set(
          accessibleGreenhouses.map((greenhouse) => greenhouse.id),
        );

        this.greenhouses.set(accessibleGreenhouses);
        this.productionCycles.set(
          cycles.filter((cycle) =>
            accessibleGreenhouseIds.has(cycle.greenhouseId),
          ),
        );
        this.categories.set(categories);
        this.expenses.set(
          expenses
            .filter((expense) =>
              accessibleGreenhouseIds.has(expense.greenhouseId),
            )
            .sort(
              (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime(),
            ),
        );
      },
    });
  }

  onPreviousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update(
      (page) => page - 1,
    );
  }

  onGreenhouseFilterChange(greenhouseId: string): void {
    this.greenhouseFilter.set(greenhouseId);
    this.cycleFilter.set('');
    this.currentPage.set(1);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.greenhouseFilter.set('');
    this.cycleFilter.set('');
    this.categoryFilter.set('');
    this.startDateFilter.set('');
    this.endDateFilter.set('');
    this.currentPage.set(1);
  }

  onNextPage(): void {
    if (
      this.currentPage() >=
      this.totalPages()
    ) {
      return;
    }

    this.currentPage.update(
      (page) => page + 1,
    );
  }

  onCreate(): void {
    this.selectedExpense.set(null);
    this.showForm.set(true);
  }

  onEdit(expense: Expense): void {
    this.selectedExpense.set(expense);
    this.showForm.set(true);
  }

  onDelete(expense: Expense): void {
    this.expenseToDelete.set(expense);
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    const expense = this.expenseToDelete();

    if (!expense) {
      return;
    }

    this.deleteExpenseUseCase
      .execute(expense.id)
      .subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.expenseToDelete.set(null);
          this.loadData();
        },
      });
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
    this.expenseToDelete.set(null);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.selectedExpense.set(null);
  }

  onFormSaved(): void {
    this.showForm.set(false);
    this.selectedExpense.set(null);
    this.loadData();
  }

  getGreenhouseName(
    greenhouseId: string,
  ): string {
    return (
      this.greenhouses().find(
        (greenhouse) =>
          greenhouse.id === greenhouseId,
      )?.name ?? 'Sin invernadero'
    );
  }

  getCategoryName(
    categoryId: string,
  ): string {
    return (
      this.categories().find(
        (category) =>
          category.id === categoryId,
      )?.name ?? 'Sin categoría'
    );
  }

  getProductionCycleName(cycleId: string): string {
    return (
      this.productionCycles().find((cycle) => cycle.id === cycleId)?.name ??
      'Sin ciclo'
    );
  }

  formatValue(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(new Date(date));
  }
}