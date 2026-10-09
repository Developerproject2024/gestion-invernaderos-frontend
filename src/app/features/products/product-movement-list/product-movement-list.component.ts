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
  Product,
  ProductMovement,
} from '../../../core/models/product.model';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { ProductionCycle } from '../../../core/models/production-cycle.model';
import { GreenhouseAccessService } from '../../../core/auth/greenhouse-access.service';

import { GetProductMovementsUseCase } from '../../../domain/use-cases/product/get-product-movements.use-case';
import { DeleteProductMovementUseCase } from '../../../domain/use-cases/product/delete-product-movement.use-case';
import { GetProductsUseCase } from '../../../domain/use-cases/product/get-products.use-case';
import { GetGreenhousesUseCase } from '../../../domain/use-cases/greenhouse/get-greenhouses.use-case';
import { GetProductionCyclesUseCase } from '../../../domain/use-cases/production-cycle/get-production-cycles.use-case';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableComponent } from '../../../shared/components/table/table.component';

import { ProductMovementFormComponent } from '../product-movement-form/product-movement-form.component';

@Component({
  selector: 'app-product-movement-list',
  standalone: true,
  imports: [
    FormsModule,
    ModalComponent,
    TableComponent,
    ProductMovementFormComponent,
  ],
  templateUrl: './product-movement-list.component.html',
  styleUrl: './product-movement-list.component.css',
})
export class ProductMovementListComponent implements OnInit {
  private readonly getProductMovementsUseCase = inject(
    GetProductMovementsUseCase,
  );

  private readonly deleteProductMovementUseCase = inject(
    DeleteProductMovementUseCase,
  );

  private readonly getProductsUseCase = inject(
    GetProductsUseCase,
  );

  private readonly getGreenhousesUseCase = inject(
    GetGreenhousesUseCase,
  );

  private readonly getProductionCyclesUseCase = inject(
    GetProductionCyclesUseCase,
  );

  private readonly greenhouseAccessService = inject(
    GreenhouseAccessService,
  );

  readonly movements = signal<ProductMovement[]>([]);

  readonly products = signal<Product[]>([]);

  readonly greenhouses = signal<Greenhouse[]>([]);

  readonly productionCycles = signal<ProductionCycle[]>([]);

  readonly showForm = signal(false);

  readonly showDeleteModal = signal(false);

  readonly selectedMovement =
    signal<ProductMovement | null>(null);

  readonly movementToDelete =
    signal<ProductMovement | null>(null);

  readonly greenhouseFilter = signal('');

  readonly cycleFilter = signal('');

  readonly productFilter = signal('');

  readonly startDateFilter = signal('');

  readonly endDateFilter = signal('');

  readonly availableCycles = computed(() => {
    const greenhouseId = this.greenhouseFilter();

    return this.productionCycles().filter(
      (cycle) => !greenhouseId || cycle.greenhouseId === greenhouseId,
    );
  });

  readonly filteredMovements = computed(() => {
    const greenhouseId = this.greenhouseFilter();
    const cycleId = this.cycleFilter();
    const productId = this.productFilter();
    const startDate = this.startDateFilter();
    const endDate = this.endDateFilter();

    return this.movements().filter((movement) =>
      (!greenhouseId || movement.greenhouseId === greenhouseId) &&
      (!cycleId || movement.productionCycleId === cycleId) &&
      (!productId || movement.productId === productId) &&
      (!startDate || movement.date >= startDate) &&
      (!endDate || movement.date <= endDate),
    );
  });

  readonly currentPage = signal(1);

  readonly pageSize = 10;

  readonly totalPages = computed(() => {
    const totalItems = this.filteredMovements().length;

    return Math.max(
      1,
      Math.ceil(totalItems / this.pageSize),
    );
  });

  readonly paginatedMovements = computed(() => {
    const startIndex =
      (this.currentPage() - 1) * this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    return this.filteredMovements().slice(
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
      movements: this.getProductMovementsUseCase.execute(),
      products: this.getProductsUseCase.execute(),
      greenhouses: this.getGreenhousesUseCase.execute(),
      cycles: this.getProductionCyclesUseCase.execute(),
    }).subscribe({
      next: ({ movements, products, greenhouses, cycles }) => {
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
        this.products.set(products);
        this.movements.set(
          movements
            .filter((movement) =>
              accessibleGreenhouseIds.has(movement.greenhouseId),
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
    this.productFilter.set('');
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
    this.selectedMovement.set(null);
    this.showForm.set(true);
  }

  onEdit(movement: ProductMovement): void {
    this.selectedMovement.set(movement);
    this.showForm.set(true);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.selectedMovement.set(null);
  }

  onFormSaved(): void {
    this.showForm.set(false);
    this.selectedMovement.set(null);

    this.loadData();
  }

  onDelete(movement: ProductMovement): void {
    this.movementToDelete.set(movement);
    this.showDeleteModal.set(true);
  }

  onDeleteCancel(): void {
    this.showDeleteModal.set(false);
    this.movementToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const movement = this.movementToDelete();

    if (!movement) {
      return;
    }

    this.deleteProductMovementUseCase
      .execute(movement.id)
      .subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.movementToDelete.set(null);

          this.loadData();
        },
      });
  }

  getProductName(productId: string): string {
    return (
      this.products().find(
        (product) => product.id === productId,
      )?.name ?? 'Sin producto'
    );
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

  getProductionCycleName(cycleId: string): string {
    return (
      this.productionCycles().find((cycle) => cycle.id === cycleId)?.name ??
      'Sin ciclo'
    );
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  getUnitValue(
    movement: ProductMovement,
  ): number {
    return (
      movement.unitValue ??
      this.products().find(
        (product) =>
          product.id === movement.productId,
      )?.value ??
      0
    );
  }

  getTotalValue(
    movement: ProductMovement,
  ): number {
    const unitValue =
      this.getUnitValue(movement);

    return (
      movement.totalValue ??
      movement.quantity * unitValue
    );
  }
}