import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { ProductionCycle } from '../../../core/models/production-cycle.model';
import { DeleteProductionCycleUseCase } from '../../../domain/use-cases/production-cycle/delete-production-cycle.use-case';
import { GetProductionCyclesUseCase } from '../../../domain/use-cases/production-cycle/get-production-cycles.use-case';
import { GetGreenhousesUseCase } from '../../../domain/use-cases/greenhouse/get-greenhouses.use-case';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ProductionCycleFormComponent } from '../production-cycle-form/production-cycle-form.component';

@Component({
  selector: 'app-production-cycle-list',
  standalone: true,
  imports: [ModalComponent, TableComponent, ProductionCycleFormComponent],
  templateUrl: './production-cycle-list.component.html',
  styleUrl: './production-cycle-list.component.css',
})
export class ProductionCycleListComponent implements OnInit {
  private readonly getCyclesUseCase = inject(GetProductionCyclesUseCase);
  private readonly deleteCycleUseCase = inject(DeleteProductionCycleUseCase);
  private readonly getGreenhousesUseCase = inject(GetGreenhousesUseCase);

  readonly cycles = signal<ProductionCycle[]>([]);
  readonly greenhouses = signal<Greenhouse[]>([]);
  readonly selectedCycle = signal<ProductionCycle | null>(null);
  readonly cycleToDelete = signal<ProductionCycle | null>(null);
  readonly showForm = signal(false);
  readonly showDeleteModal = signal(false);
  readonly errorMessage = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.cycles().length / this.pageSize)),
  );

  readonly paginatedCycles = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.cycles().slice(startIndex, startIndex + this.pageSize);
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.getCyclesUseCase.execute().subscribe({
      next: (cycles) => {
        this.errorMessage.set('');
        this.currentPage.set(1);
        this.cycles.set(
          [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate)),
        );
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los ciclos de producción.');
      },
    });

    this.getGreenhousesUseCase.execute().subscribe({
      next: (greenhouses) => this.greenhouses.set(greenhouses),
      error: () => {
        this.errorMessage.set('No se pudieron cargar los invernaderos.');
      },
    });
  }

  getGreenhouseName(greenhouseId: string): string {
    return (
      this.greenhouses().find((greenhouse) => greenhouse.id === greenhouseId)
        ?.name ?? 'Invernadero eliminado'
    );
  }

  onPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  onNextPage(): void {
    this.currentPage.update((page) =>
      Math.min(this.totalPages(), page + 1),
    );
  }

  onCreate(): void {
    this.selectedCycle.set(null);
    this.showForm.set(true);
  }

  onEdit(cycle: ProductionCycle): void {
    this.selectedCycle.set(cycle);
    this.showForm.set(true);
  }

  onDelete(cycle: ProductionCycle): void {
    this.cycleToDelete.set(cycle);
    this.showDeleteModal.set(true);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.selectedCycle.set(null);
  }

  onFormSaved(): void {
    this.onFormCancel();
    this.loadData();
  }

  onDeleteCancel(): void {
    this.showDeleteModal.set(false);
    this.cycleToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const cycle = this.cycleToDelete();

    if (!cycle) {
      return;
    }

    this.deleteCycleUseCase.execute(cycle.id).subscribe({
      next: () => {
        this.errorMessage.set('');
        this.onDeleteCancel();
        this.loadData();
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar el ciclo. Inténtalo nuevamente.');
      },
    });
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`));
  }
}
