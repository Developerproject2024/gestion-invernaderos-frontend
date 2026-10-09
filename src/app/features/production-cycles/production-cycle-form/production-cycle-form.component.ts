import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { ProductionCycle } from '../../../core/models/production-cycle.model';
import { CreateProductionCycleUseCase } from '../../../domain/use-cases/production-cycle/create-production-cycle.use-case';
import { UpdateProductionCycleUseCase } from '../../../domain/use-cases/production-cycle/update-production-cycle.use-case';

const dateRangeValidator: ValidatorFn = (
  control,
): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value as string | undefined;
  const endDate = control.get('endDate')?.value as string | undefined;

  return startDate && endDate && endDate < startDate
    ? { invalidDateRange: true }
    : null;
};

@Component({
  selector: 'app-production-cycle-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './production-cycle-form.component.html',
  styleUrl: './production-cycle-form.component.css',
})
export class ProductionCycleFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly createCycleUseCase = inject(CreateProductionCycleUseCase);
  private readonly updateCycleUseCase = inject(UpdateProductionCycleUseCase);

  readonly cycle = input<ProductionCycle | null>(null);
  readonly greenhouses = input<Greenhouse[]>([]);
  readonly saved = output<void>();
  readonly cancelled = output<void>();
  readonly isSaving = signal(false);
  readonly saveError = signal('');

  readonly form = this.formBuilder.nonNullable.group(
    {
      greenhouseId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['PLANNED' as ProductionCycle['status'], Validators.required],
    },
    { validators: dateRangeValidator },
  );

  constructor() {
    effect(() => {
      const cycle = this.cycle();

      if (cycle) {
        this.form.reset({
          greenhouseId: cycle.greenhouseId,
          name: cycle.name,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          status: cycle.status,
        });
        return;
      }

      this.form.reset({
        greenhouseId: '',
        name: '',
        startDate: '',
        endDate: '',
        status: 'PLANNED',
      });
    });
  }

  get isEditMode(): boolean {
    return this.cycle() !== null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saveError.set('');
    this.isSaving.set(true);
    const formValue = this.form.getRawValue();
    const cycle = this.cycle();
    const payload = {
      ...formValue,
      name: formValue.name.trim(),
    };

    const save$ = cycle
      ? this.updateCycleUseCase.execute({ ...payload, id: cycle.id })
      : this.createCycleUseCase.execute(payload);

    save$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('No se pudo guardar el ciclo. Inténtalo nuevamente.');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
