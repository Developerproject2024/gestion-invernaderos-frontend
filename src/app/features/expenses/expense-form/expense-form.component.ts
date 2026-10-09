import {
  Component,
  effect,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  Expense,
  ExpenseCategory,
} from '../../../core/models/expense.model';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { ProductionCycle } from '../../../core/models/production-cycle.model';

import { CreateExpenseUseCase } from '../../../domain/use-cases/expense/create-expense.use-case';
import { UpdateExpenseUseCase } from '../../../domain/use-cases/expense/update-expense.use-case';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css',
})
export class ExpenseFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  private readonly createExpenseUseCase =
    inject(CreateExpenseUseCase);

  private readonly updateExpenseUseCase =
    inject(UpdateExpenseUseCase);

  readonly expense = input<Expense | null>(null);

  readonly categories = input<ExpenseCategory[]>([]);
  readonly greenhouses = input<Greenhouse[]>([]);
  readonly productionCycles = input<ProductionCycle[]>([]);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isSaving = signal(false);

  readonly expenseForm = this.formBuilder.nonNullable.group({
    date: ['', Validators.required],

    greenhouseId: ['', Validators.required],

    productionCycleId: ['', Validators.required],

    expenseCategoryId: ['', Validators.required],

    quantity: [
      1,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],

    value: [
      0,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],
  });

  private readonly selectedGreenhouseId = toSignal(
    this.expenseForm.controls.greenhouseId.valueChanges,
    { initialValue: this.expenseForm.controls.greenhouseId.value },
  );

  readonly availableCycles = computed(() => {
    const currentCycleId = this.expense()?.productionCycleId;

    return this.productionCycles().filter(
      (cycle) =>
        cycle.greenhouseId === this.selectedGreenhouseId() &&
        (cycle.status === 'ACTIVE' || cycle.id === currentCycleId),
    );
  });

  constructor() {
    effect(() => {
      const expense = this.expense();

      if (expense) {
        this.expenseForm.patchValue({
          date: expense.date,
          greenhouseId: expense.greenhouseId,
          productionCycleId: expense.productionCycleId,
          expenseCategoryId: expense.expenseCategoryId,
          quantity: expense.quantity,
          value: expense.value,
        });

        return;
      }

      this.expenseForm.reset({
        date: '',
        greenhouseId: '',
        productionCycleId: '',
        expenseCategoryId: '',
        quantity: 1,
        value: 0,
      });
    });
  }

  get isEditMode(): boolean {
    return this.expense() !== null;
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValue = this.expenseForm.getRawValue();
    const expense = this.expense();

    if (expense) {
      const updatedExpense: Expense = {
        id: expense.id,
        date: formValue.date,
        greenhouseId: formValue.greenhouseId,
        productionCycleId: formValue.productionCycleId,
        expenseCategoryId: formValue.expenseCategoryId,
        quantity: formValue.quantity,
        value: formValue.value,
      };

      this.updateExpenseUseCase
        .execute(updatedExpense)
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.saved.emit();
          },
          error: () => {
            this.isSaving.set(false);
          },
        });

      return;
    }

    const newExpense: Omit<Expense, 'id'> = {
      date: formValue.date,
      greenhouseId: formValue.greenhouseId,
      productionCycleId: formValue.productionCycleId,
      expenseCategoryId: formValue.expenseCategoryId,
      quantity: formValue.quantity,
      value: formValue.value,
    };

    this.createExpenseUseCase
      .execute(newExpense)
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  onGreenhouseChange(): void {
    this.expenseForm.controls.productionCycleId.reset('');
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}