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
  ProductMovementPayment,
} from '../../../core/models/product.model';
import { Greenhouse } from '../../../core/models/greenhouse.model';
import { ProductionCycle } from '../../../core/models/production-cycle.model';
import { GreenhouseAccessService } from '../../../core/auth/greenhouse-access.service';
import { GetProductMovementsUseCase } from '../../../domain/use-cases/product/get-product-movements.use-case';
import { GetProductsUseCase } from '../../../domain/use-cases/product/get-products.use-case';
import { GetGreenhousesUseCase } from '../../../domain/use-cases/greenhouse/get-greenhouses.use-case';
import { GetProductionCyclesUseCase } from '../../../domain/use-cases/production-cycle/get-production-cycles.use-case';
import { UpdateProductMovementUseCase } from '../../../domain/use-cases/product/update-product-movement.use-case';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableComponent } from '../../../shared/components/table/table.component';

type PortfolioStatusFilter = 'ALL' | 'PENDING' | 'PARTIAL' | 'PAID';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports: [FormsModule, ModalComponent, TableComponent],
  templateUrl: './portfolio-list.component.html',
})
export class PortfolioListComponent implements OnInit {
  private readonly getMovements = inject(GetProductMovementsUseCase);
  private readonly getProducts = inject(GetProductsUseCase);
  private readonly getGreenhouses = inject(GetGreenhousesUseCase);
  private readonly getProductionCycles = inject(GetProductionCyclesUseCase);
  private readonly updateMovement = inject(UpdateProductMovementUseCase);
  private readonly greenhouseAccess = inject(GreenhouseAccessService);

  readonly movements = signal<ProductMovement[]>([]);
  readonly products = signal<Product[]>([]);
  readonly greenhouses = signal<Greenhouse[]>([]);
  readonly productionCycles = signal<ProductionCycle[]>([]);
  readonly selectedMovement = signal<ProductMovement | null>(null);
  readonly paymentAmount = signal<number | null>(null);
  readonly paymentDate = signal('');
  readonly paymentError = signal('');
  readonly loadError = signal('');
  readonly isSaving = signal(false);
  readonly statusFilter = signal<PortfolioStatusFilter>('ALL');
  readonly greenhouseFilter = signal('');
  readonly cycleFilter = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly availableCycles = computed(() => {
    const greenhouseId = this.greenhouseFilter();

    return this.productionCycles().filter(
      (cycle) =>
        cycle.status === 'ACTIVE' &&
        (!greenhouseId || cycle.greenhouseId === greenhouseId),
    );
  });

  readonly filteredMovements = computed(() => {
    const filter = this.statusFilter();
    const greenhouseId = this.greenhouseFilter();
    const cycleId = this.cycleFilter();

    return this.movements().filter((movement) => {
      const state = this.getStatus(movement);

      return (
        (!greenhouseId || movement.greenhouseId === greenhouseId) &&
        (!cycleId || movement.productionCycleId === cycleId) &&
        (filter === 'ALL' || state === filter)
      );
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredMovements().length / this.pageSize)),
  );

  readonly paginatedMovements = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredMovements().slice(start, start + this.pageSize);
  });

  readonly totalReceivable = computed(() =>
    this.movements().reduce(
      (total, movement) => total + this.getBalance(movement),
      0,
    ),
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadError.set('');

    forkJoin({
      movements: this.getMovements.execute(),
      products: this.getProducts.execute(),
      greenhouses: this.getGreenhouses.execute(),
      cycles: this.getProductionCycles.execute(),
    }).subscribe({
      next: ({ movements, products, greenhouses, cycles }) => {
        const accessibleGreenhouses =
          this.greenhouseAccess.filterForCurrentUser(greenhouses);
        const accessibleIds = new Set(
          accessibleGreenhouses.map((greenhouse) => greenhouse.id),
        );

        this.movements.set(
          movements
            .filter((movement) => accessibleIds.has(movement.greenhouseId))
            .sort((a, b) => b.date.localeCompare(a.date)),
        );
        this.products.set(products);
        this.greenhouses.set(accessibleGreenhouses);
        this.productionCycles.set(
          cycles.filter((cycle) => accessibleIds.has(cycle.greenhouseId)),
        );
        this.currentPage.set(1);
      },
      error: () => {
        this.loadError.set('No se pudo cargar la cartera. Intenta nuevamente.');
      },
    });
  }

  getStatus(movement: ProductMovement): PortfolioStatusFilter {
    const paid = this.getPaid(movement);
    if (paid <= 0) return 'PENDING';
    if (paid >= movement.totalValue) return 'PAID';
    return 'PARTIAL';
  }

  getPaid(movement: ProductMovement): number {
    return (movement.payments ?? []).reduce(
      (total, payment) => total + payment.amount,
      0,
    );
  }

  getBalance(movement: ProductMovement): number {
    return Math.max(0, movement.totalValue - this.getPaid(movement));
  }

  getProductName(productId: string): string {
    return this.products().find((product) => product.id === productId)?.name ??
      'Sin producto';
  }

  getGreenhouseName(greenhouseId: string): string {
    return this.greenhouses().find((item) => item.id === greenhouseId)?.name ??
      'Sin invernadero';
  }

  getProductionCycleName(cycleId: string): string {
    return this.productionCycles().find((cycle) => cycle.id === cycleId)?.name ??
      'Sin ciclo';
  }

  openPayment(movement: ProductMovement): void {
    this.selectedMovement.set(movement);
    this.paymentAmount.set(this.getBalance(movement));
    this.paymentDate.set(this.today());
    this.paymentError.set('');
  }

  closePayment(): void {
    if (this.isSaving()) return;
    this.selectedMovement.set(null);
    this.paymentError.set('');
  }

  submitPayment(): void {
    const movement = this.selectedMovement();
    const amount = Number(this.paymentAmount());
    const balance = movement ? this.getBalance(movement) : 0;

    if (!movement) return;
    if (!Number.isFinite(amount) || amount <= 0 || amount > balance) {
      this.paymentError.set(
        `Ingresa un abono mayor que cero y no superior al saldo de ${this.formatCurrency(balance)}.`,
      );
      return;
    }
    if (!this.paymentDate()) {
      this.paymentError.set('Selecciona la fecha del pago.');
      return;
    }

    const payment: ProductMovementPayment = {
      id: crypto.randomUUID(),
      date: this.paymentDate(),
      amount,
    };

    this.isSaving.set(true);
    this.paymentError.set('');
    this.updateMovement
      .execute({
        ...movement,
        payments: [...(movement.payments ?? []), payment],
      })
      .subscribe({
        next: (updated) => {
          this.movements.update((items) =>
            items.map((item) => item.id === updated.id ? updated : item),
          );
          this.isSaving.set(false);
          this.selectedMovement.set(null);
        },
        error: () => {
          this.isSaving.set(false);
          this.paymentError.set('No se pudo registrar el pago. Intenta nuevamente.');
        },
      });
  }

  onStatusFilterChange(value: PortfolioStatusFilter): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  onGreenhouseFilterChange(greenhouseId: string): void {
    this.greenhouseFilter.set(greenhouseId);
    this.cycleFilter.set('');
    this.currentPage.set(1);
  }

  onCycleFilterChange(cycleId: string): void {
    this.cycleFilter.set(cycleId);
    this.currentPage.set(1);
  }

  previousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
  }

  private today(): string {
    const now = new Date();
    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60_000,
    );
    return localDate.toISOString().slice(0, 10);
  }
}
