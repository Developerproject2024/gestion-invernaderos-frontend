import { Component, inject, OnInit, signal } from '@angular/core';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { MOCK_USERS } from '../../../infrastructure/data/mock-users';
import { DeleteGreenhouseUseCase } from '../../../domain/use-cases/greenhouse/delete-greenhouse.use-case';
import { GetGreenhousesUseCase } from '../../../domain/use-cases/greenhouse/get-greenhouses.use-case';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { GreenhouseFormComponent } from '../greenhouse-form/greenhouse-form.component';

@Component({
  selector: 'app-greenhouse-list',
  standalone: true,
  imports: [
    ModalComponent,
    GreenhouseFormComponent,
  ],
  templateUrl: './greenhouse-list.component.html',
  styleUrl: './greenhouse-list.component.css',
})
export class GreenhouseListComponent implements OnInit {
  private readonly getGreenhousesUseCase = inject(GetGreenhousesUseCase);
  private readonly deleteGreenhouseUseCase = inject(DeleteGreenhouseUseCase);

  readonly greenhouses = signal<Greenhouse[]>([]);

  readonly showForm = signal(false);
  readonly showDeleteModal = signal(false);

  readonly selectedGreenhouse = signal<Greenhouse | null>(null);
  readonly greenhouseToDelete = signal<Greenhouse | null>(null);

  getAssignedUserNames(userIds: string[]): string {
    const names = MOCK_USERS
      .filter((user) => userIds.includes(user.id))
      .map((user) => user.name);

    return names.length > 0 ? names.join(', ') : 'Sin asignar';
  }

  ngOnInit(): void {
    this.loadGreenhouses();
  }

  private loadGreenhouses(): void {
    this.getGreenhousesUseCase.execute().subscribe({
      next: (greenhouses) => {
        this.greenhouses.set(greenhouses);
      },
    });
  }

  onCreate(): void {
    this.selectedGreenhouse.set(null);
    this.showForm.set(true);
  }

  onEdit(greenhouse: Greenhouse): void {
    this.selectedGreenhouse.set(greenhouse);
    this.showForm.set(true);
  }

  onDelete(greenhouse: Greenhouse): void {
    this.greenhouseToDelete.set(greenhouse);
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    const greenhouse = this.greenhouseToDelete();

    if (!greenhouse) {
      return;
    }

    this.deleteGreenhouseUseCase.execute(greenhouse.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.greenhouseToDelete.set(null);
        this.loadGreenhouses();
      },
    });
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
    this.greenhouseToDelete.set(null);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.selectedGreenhouse.set(null);
  }

  onFormSaved(): void {
    this.showForm.set(false);
    this.selectedGreenhouse.set(null);
    this.loadGreenhouses();
  }
}