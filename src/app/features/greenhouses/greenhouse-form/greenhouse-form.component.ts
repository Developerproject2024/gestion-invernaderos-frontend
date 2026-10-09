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
  Validators,
} from '@angular/forms';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { User } from '../../../core/models/user.model';
import { CreateGreenhouseUseCase } from '../../../domain/use-cases/greenhouse/create-greenhouse.use-case';
import { UpdateGreenhouseUseCase } from '../../../domain/use-cases/greenhouse/update-greenhouse.use-case';
import { MOCK_USERS } from '../../../infrastructure/data/mock-users';

@Component({
  selector: 'app-greenhouse-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './greenhouse-form.component.html',
  styleUrl: './greenhouse-form.component.css',
})
export class GreenhouseFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly createGreenhouseUseCase = inject(CreateGreenhouseUseCase);
  private readonly updateGreenhouseUseCase = inject(UpdateGreenhouseUseCase);

  readonly greenhouse = input<Greenhouse | null>(null);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isSaving = signal(false);

  readonly assignableUsers: User[] = MOCK_USERS.filter(
    (user) => user.role !== 'ADMIN',
  );

  readonly greenhouseForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    status: ['ACTIVE' as Greenhouse['status'], Validators.required],
    assignedUserIds: this.formBuilder.nonNullable.control<string[]>([]),
  });

  constructor() {
    effect(() => {
      const greenhouse = this.greenhouse();

      if (greenhouse) {
        this.greenhouseForm.patchValue({
          name: greenhouse.name,
          status: greenhouse.status,
          assignedUserIds: greenhouse.assignedUserIds,
        });

        return;
      }

      this.greenhouseForm.reset({
        name: '',
        status: 'ACTIVE',
        assignedUserIds: [],
      });
    });
  }

  get isEditMode(): boolean {
    return this.greenhouse() !== null;
  }

  onSubmit(): void {
    if (this.greenhouseForm.invalid) {
      this.greenhouseForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValue = this.greenhouseForm.getRawValue();
    const greenhouse = this.greenhouse();

    if (greenhouse) {
      const updatedGreenhouse: Greenhouse = {
        id: greenhouse.id,
        name: greenhouse.name,
        status: formValue.status,
        assignedUserIds: formValue.assignedUserIds,
      };

      this.updateGreenhouseUseCase.execute(updatedGreenhouse).subscribe({
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

    const newGreenhouse: Omit<Greenhouse, 'id'> = {
      name: formValue.name.trim(),
      status: formValue.status,
      assignedUserIds: formValue.assignedUserIds,
    };

    this.createGreenhouseUseCase.execute(newGreenhouse).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}