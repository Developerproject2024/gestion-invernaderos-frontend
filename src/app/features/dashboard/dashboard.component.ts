import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { forkJoin } from 'rxjs';

import {
  DashboardData,
  DashboardFilters,
} from '../../core/models/dashboard.model';

import { Expense } from '../../core/models/expense.model';

import {
  Product,
  ProductMovement,
} from '../../core/models/product.model';

import { Greenhouse } from '../../core/models/greenhouse.model';
import { ProductionCycle } from '../../core/models/production-cycle.model';
import { GreenhouseAccessService } from '../../core/auth/greenhouse-access.service';

import { GetGreenhousesUseCase } from '../../domain/use-cases/greenhouse/get-greenhouses.use-case';
import { GetProductionCyclesUseCase } from '../../domain/use-cases/production-cycle/get-production-cycles.use-case';

import { GetExpensesUseCase } from '../../domain/use-cases/expense/get-expenses.use-case';

import { GetProductsUseCase } from '../../domain/use-cases/product/get-products.use-case';

import { GetProductMovementsUseCase } from '../../domain/use-cases/product/get-product-movements.use-case';

import { DashboardFacade } from './dashboard.facade';

import { TableComponent } from '../../shared/components/table/table.component';

type KpiTrafficLight = 'high' | 'medium' | 'low';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    BaseChartDirective,
    TableComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardFacade =
    inject(DashboardFacade);

  private readonly getGreenhousesUseCase =
    inject(GetGreenhousesUseCase);

  private readonly greenhouseAccessService =
    inject(GreenhouseAccessService);

  private readonly getProductionCyclesUseCase =
    inject(GetProductionCyclesUseCase);

  private readonly getExpensesUseCase =
    inject(GetExpensesUseCase);

  private readonly getProductsUseCase =
    inject(GetProductsUseCase);

  private readonly getProductMovementsUseCase =
    inject(GetProductMovementsUseCase);

  readonly greenhouses =
    signal<Greenhouse[]>([]);

  readonly productionCycles =
    signal<ProductionCycle[]>([]);

  readonly filteredExpenses =
    signal<Expense[]>([]);

  readonly filteredMovements =
    signal<ProductMovement[]>([]);

  readonly expensesPage =
    signal(1);

  readonly movementsPage =
    signal(1);

  readonly pageSize = 10;

  readonly filters =
    this.dashboardFacade.filters;

  readonly data =
    this.dashboardFacade.data;

  readonly kpis =
    this.dashboardFacade.kpis;

  readonly expensesChart =
    this.dashboardFacade.expensesChart;

  readonly productionByGreenhouse =
    this.dashboardFacade.productionByGreenhouse;

  readonly productionByProduct =
    this.dashboardFacade.productionByProduct;

  readonly selectedGreenhouse =
    computed(
      () => this.filters().greenhouseId,
    );

  readonly selectedProductionCycle =
    computed(
      () => this.filters().productionCycleId,
    );

  readonly availableCycles =
    computed(() => {
      const greenhouseId = this.selectedGreenhouse();

      return this.productionCycles().filter(
        (cycle) =>
          !greenhouseId ||
          cycle.greenhouseId === greenhouseId,
      );
    });

  readonly startDate =
    computed(
      () => this.filters().startDate,
    );

  readonly endDate =
    computed(
      () => this.filters().endDate,
    );

  getNetValueTrafficLight(value: number): KpiTrafficLight {
    return value >= 500_000 ? 'high' : value >= 0 ? 'medium' : 'low';
  }

  getKpiTrafficLightLabel(level: KpiTrafficLight): string {
    return level === 'high'
      ? 'Alto'
      : level === 'medium'
        ? 'Medio'
        : 'Bajo';
  }

  readonly paginatedExpenses =
    computed(() => {
      const page = this.expensesPage();

      const start =
        (page - 1) * this.pageSize;

      return this.filteredExpenses()
        .slice(
          start,
          start + this.pageSize,
        );
    });

  readonly paginatedMovements =
    computed(() => {
      const page = this.movementsPage();

      const start =
        (page - 1) * this.pageSize;

      return this.filteredMovements()
        .slice(
          start,
          start + this.pageSize,
        );
    });

  readonly expensesTotalPages =
    computed(() =>
      Math.max(
        1,
        Math.ceil(
          this.filteredExpenses().length /
            this.pageSize,
        ),
      ),
    );

  readonly movementsTotalPages =
    computed(() =>
      Math.max(
        1,
        Math.ceil(
          this.filteredMovements().length /
            this.pageSize,
        ),
      ),
    );

  /**
   * Gráfica de gastos por categoría.
   */
  readonly expensesChartData =
    computed<
      ChartConfiguration<'bar'>['data']
    >(
      () => ({
        labels:
          this.expensesChart().map(
            (item) => item.label,
          ),

        datasets: [
          {
            label: 'Gastos',
            data:
              this.expensesChart().map(
                (item) => item.value,
              ),
            backgroundColor: '#E53935',
            borderColor: '#B71C1C',
            borderWidth: 1,
          },
        ],
      }),
    );

  readonly expensesChartOptions:
    ChartConfiguration<'bar'>['options'] =
    {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: (value) =>
              this.formatCurrency(
                Number(value),
              ),
          },
        },
      },
    };

  /**
   * Gráfica de producción por invernadero.
   *
   * Muestra kilos producidos.
   */
  readonly productionChartData =
    computed<
      ChartConfiguration<'bar'>['data']
    >(
      () => ({
        labels:
          this.productionByGreenhouse().map(
            (item) => item.label,
          ),

        datasets: [
          {
            label: 'Kilos producidos',
            data:
              this.productionByGreenhouse().map(
                (item) => item.quantity,
              ),
            backgroundColor: '#43A047',
            borderColor: '#2E7D32',
            borderWidth: 1,
          },
        ],
      }),
    );

  readonly productionChartOptions:
    ChartConfiguration<'bar'>['options'] =
    {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: (value) =>
              `${Number(value)} kg`,
          },
        },
      },
    };

  /**
   * Gráfica de valor de producción por producto.
   *
   * Muestra el valor económico de la producción.
   */
  readonly productionValueChartData =
    computed<
      ChartConfiguration<'bar'>['data']
    >(
      () => ({
        labels:
          this.productionByProduct().map(
            (item) => item.label,
          ),

        datasets: [
          {
            label: 'Valor producción',
            data:
              this.productionByProduct().map(
                (item) => item.value,
              ),
            backgroundColor: '#E53935',
            borderColor: '#B71C1C',
            borderWidth: 1,
          },
        ],
      }),
    );

  readonly productionValueChartOptions:
    ChartConfiguration<'bar'>['options'] =
    {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback: (value) =>
              this.formatCurrency(
                Number(value),
              ),
          },
        },
      },
    };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    forkJoin({
      expenses:
        this.getExpensesUseCase.getAll(),

      greenhouses:
        this.getGreenhousesUseCase.execute(),

      cycles:
        this.getProductionCyclesUseCase.execute(),

      products:
        this.getProductsUseCase.execute(),

      movements:
        this.getProductMovementsUseCase.execute(),
    }).subscribe({
      next: ({
        expenses,
        greenhouses,
        cycles,
        products,
        movements,
      }) => {
        const accessibleGreenhouses =
          this.greenhouseAccessService.filterForCurrentUser(
            greenhouses,
          );
        const accessibleGreenhouseIds = new Set(
          accessibleGreenhouses.map(
            (greenhouse) => greenhouse.id,
          ),
        );

        this.greenhouses.set(
          accessibleGreenhouses.filter(
            (greenhouse) => greenhouse.status === 'ACTIVE',
          ),
        );
        this.productionCycles.set(
          cycles.filter((cycle) =>
            accessibleGreenhouseIds.has(cycle.greenhouseId),
          ),
        );

        this.calculateDashboard(
          expenses.filter((expense) =>
            accessibleGreenhouseIds.has(expense.greenhouseId),
          ),
          products,
          movements.filter((movement) =>
            accessibleGreenhouseIds.has(movement.greenhouseId),
          ),
        );
      },
    });
  }

  private calculateDashboard(
    expenses: Expense[],
    products: Product[],
    movements: ProductMovement[],
  ): void {
    const currentFilters =
      this.filters();

    const filteredExpenses =
      expenses.filter((expense) => {
        if (
          currentFilters.greenhouseId &&
          expense.greenhouseId !==
            currentFilters.greenhouseId
        ) {
          return false;
        }

        if (
          currentFilters.productionCycleId &&
          expense.productionCycleId !==
            currentFilters.productionCycleId
        ) {
          return false;
        }

        if (
          currentFilters.startDate &&
          expense.date <
            currentFilters.startDate
        ) {
          return false;
        }

        if (
          currentFilters.endDate &&
          expense.date >
            currentFilters.endDate
        ) {
          return false;
        }

        return true;
      });

    const filteredMovements =
      movements.filter((movement) => {
        if (
          currentFilters.greenhouseId &&
          movement.greenhouseId !==
            currentFilters.greenhouseId
        ) {
          return false;
        }

        if (
          currentFilters.productionCycleId &&
          movement.productionCycleId !==
            currentFilters.productionCycleId
        ) {
          return false;
        }

        if (
          currentFilters.startDate &&
          movement.date <
            currentFilters.startDate
        ) {
          return false;
        }

        if (
          currentFilters.endDate &&
          movement.date >
            currentFilters.endDate
        ) {
          return false;
        }

        return true;
      });

    this.filteredExpenses.set(
      [...filteredExpenses].sort(
        (a, b) =>
          b.date.localeCompare(a.date),
      ),
    );

    this.filteredMovements.set(
      [...filteredMovements].sort(
        (a, b) =>
          b.date.localeCompare(a.date),
      ),
    );

    this.expensesPage.set(1);
    this.movementsPage.set(1);

    /**
     * ==============================
     * KPI
     * ==============================
     */

    const totalExpenses =
      filteredExpenses.reduce(
        (total, expense) =>
          total + expense.value,
        0,
      );

    const totalProductionQuantity =
      filteredMovements.reduce(
        (total, movement) =>
          total + movement.quantity,
        0,
      );

    const totalProductionValue =
      filteredMovements.reduce(
        (total, movement) => {
          const product =
            products.find(
              (item) =>
                item.id === movement.productId,
            );

          const unitValue =
            movement.unitValue ??
            product?.value ??
            0;

          return (
            total +
            movement.quantity *
              unitValue
          );
        },
        0,
      );

    const totalNetValue =
      totalProductionValue -
      totalExpenses;

    const {
      totalPaidProduction,
      totalPartialPayments,
      totalPendingBalance,
    } =
      filteredMovements.reduce(
        (totals, movement) => {
          const paid = (movement.payments ?? []).reduce(
            (sum, payment) => sum + payment.amount,
            0,
          );

          if (paid > 0 && paid >= movement.totalValue) {
            totals.totalPaidProduction += movement.totalValue;
          } else if (paid > 0) {
            totals.totalPartialPayments += paid;
          }

          totals.totalPendingBalance += Math.max(
            0,
            movement.totalValue - paid,
          );

          return totals;
        },
        {
          totalPaidProduction: 0,
          totalPartialPayments: 0,
          totalPendingBalance: 0,
        },
      );

    /**
     * ==============================
     * PRODUCCIÓN POR INVERNADERO
     * ==============================
     */

    const productionByGreenhouseMap =
      filteredMovements.reduce(
        (result, movement) => {
          const greenhouse =
            this.greenhouses().find(
              (item) =>
                item.id ===
                movement.greenhouseId,
            );

          const product =
            products.find(
              (item) =>
                item.id ===
                movement.productId,
            );

          const label =
            greenhouse?.name ??
            'Sin invernadero';

          const unitValue =
            movement.unitValue ??
            product?.value ??
            0;

          const movementValue =
            movement.quantity *
            unitValue;

          if (!result[label]) {
            result[label] = {
              greenhouseId:
                movement.greenhouseId,
              quantity: 0,
              value: 0,
            };
          }

          result[label].quantity +=
            movement.quantity;

          result[label].value +=
            movementValue;

          return result;
        },
        {} as Record<
          string,
          {
            greenhouseId: string;
            quantity: number;
            value: number;
          }
        >,
      );

    /**
     * ==============================
     * PRODUCCIÓN POR PRODUCTO
     * ==============================
     */

    const productionByProductMap =
      filteredMovements.reduce(
        (result, movement) => {
          const product =
            products.find(
              (item) =>
                item.id ===
                movement.productId,
            );

          const label =
            product?.name ??
            'Sin producto';

          const unitValue =
            movement.unitValue ??
            product?.value ??
            0;

          const movementValue =
            movement.quantity *
            unitValue;

          if (!result[label]) {
            result[label] = {
              productId:
                movement.productId,
              quantity: 0,
              unitValue,
              value: 0,
            };
          }

          result[label].quantity +=
            movement.quantity;

          result[label].value +=
            movementValue;

          /**
           * Si existen movimientos
           * con valores diferentes,
           * conservamos el valor del
           * producto actual.
           */
          result[label].unitValue =
            unitValue;

          return result;
        },
        {} as Record<
          string,
          {
            productId: string;
            quantity: number;
            unitValue: number;
            value: number;
          }
        >,
      );

    /**
     * ==============================
     * GASTOS POR CATEGORÍA
     * ==============================
     *
     * En este punto se agrupan por
     * expenseCategoryId. La etiqueta
     * temporal es el ID porque el
     * Dashboard actual no carga las
     * categorías.
     *
     * Si tu HTML ya muestra el nombre
     * de categoría, posteriormente
     * podemos conectar GetCategories.
     */

    const expensesByCategory =
      filteredExpenses.reduce(
        (result, expense) => {
          const label =
            expense.expenseCategoryId;

          result[label] =
            (result[label] ?? 0) +
            expense.value;

          return result;
        },
        {} as Record<string, number>,
      );

    const dashboardData:
      DashboardData = {
      kpis: {
        totalExpenses,
        totalProductionQuantity,
        totalProductionValue,
        totalNetValue,
        totalPaidProduction,
        totalPartialPayments,
        totalPendingBalance,
      },

      productionByGreenhouse:
        Object.entries(
          productionByGreenhouseMap,
        ).map(
          ([
            label,
            item,
          ]) => ({
            greenhouseId:
              item.greenhouseId,
            label,
            quantity:
              Number(item.quantity),
            value:
              Number(item.value),
          }),
        ),

      productionByProduct:
        Object.entries(
          productionByProductMap,
        ).map(
          ([
            label,
            item,
          ]) => ({
            productId:
              item.productId,
            label,
            quantity:
              Number(item.quantity),
            unitValue:
              Number(item.unitValue),
            value:
              Number(item.value),
          }),
        ),

      expensesChart:
        Object.entries(
          expensesByCategory,
        ).map(
          ([label, value]) => ({
            label,
            value: Number(value),
          }),
        ),
    };

    this.dashboardFacade.setData(
      dashboardData,
    );
  }

  onGreenhouseChange(
    greenhouseId: string,
  ): void {
    const current =
      this.filters();

    const newFilters:
      DashboardFilters = {
      ...current,
      greenhouseId:
        greenhouseId || null,
      productionCycleId: null,
    };

    this.dashboardFacade
      .updateFilters(newFilters);

    this.loadDashboardData();
  }

  onProductionCycleChange(
    productionCycleId: string,
  ): void {
    const current = this.filters();

    this.dashboardFacade.updateFilters({
      ...current,
      productionCycleId: productionCycleId || null,
    });

    this.loadDashboardData();
  }

  onStartDateChange(
    startDate: string,
  ): void {
    const current =
      this.filters();

    const newFilters:
      DashboardFilters = {
      ...current,
      startDate:
        startDate || null,
    };

    this.dashboardFacade
      .updateFilters(newFilters);

    this.loadDashboardData();
  }

  onEndDateChange(
    endDate: string,
  ): void {
    const current =
      this.filters();

    const newFilters:
      DashboardFilters = {
      ...current,
      endDate:
        endDate || null,
    };

    this.dashboardFacade
      .updateFilters(newFilters);

    this.loadDashboardData();
  }

  clearFilters(): void {
    this.dashboardFacade
      .updateFilters({
        greenhouseId: null,
        productionCycleId: null,
        startDate: null,
        endDate: null,
      });

    this.loadDashboardData();
  }

  previousExpensesPage(): void {
    this.expensesPage.update(
      (page) =>
        Math.max(1, page - 1),
    );
  }

  nextExpensesPage(): void {
    this.expensesPage.update(
      (page) =>
        Math.min(
          this.expensesTotalPages(),
          page + 1,
        ),
    );
  }

  previousMovementsPage(): void {
    this.movementsPage.update(
      (page) =>
        Math.max(1, page - 1),
    );
  }

  nextMovementsPage(): void {
    this.movementsPage.update(
      (page) =>
        Math.min(
          this.movementsTotalPages(),
          page + 1,
        ),
    );
  }

  getGreenhouseName(
    greenhouseId: string,
  ): string {
    return (
      this.greenhouses().find(
        (greenhouse) =>
          greenhouse.id ===
          greenhouseId,
      )?.name ??
      'Sin invernadero'
    );
  }

  getProductName(
    productId: string,
  ): string {
    const product =
      this.productionByProduct().find(
        (item) =>
          item.productId === productId,
      );

    return (
      product?.label ??
      'Sin producto'
    );
  }

  getProductionCycleName(cycleId: string): string {
    return (
      this.productionCycles().find((cycle) => cycle.id === cycleId)?.name ??
      'Sin ciclo'
    );
  }

  formatCurrency(
    value: number,
  ): string {
    return new Intl.NumberFormat(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      },
    ).format(value);
  }

  formatQuantity(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatDate(
    value: string,
  ): string {
    const [
      year,
      month,
      day,
    ] = value.split('-');

    return `${day}/${month}/${year}`;
  }
}