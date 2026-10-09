import { Injectable, computed, signal } from '@angular/core';

import {
  DashboardData,
  DashboardFilters,
} from '../../core/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardFacade {
  private readonly filtersSignal =
    signal<DashboardFilters>({
      greenhouseId: null,
      productionCycleId: null,
      startDate: null,
      endDate: null,
    });

  private readonly dataSignal =
    signal<DashboardData>({
      kpis: {
        totalExpenses: 0,
        totalProductionQuantity: 0,
        totalProductionValue: 0,
        totalNetValue: 0,
        totalPaidProduction: 0,
        totalPartialPayments: 0,
        totalPendingBalance: 0,
      },

      productionByGreenhouse: [],
      productionByProduct: [],
      expensesChart: [],
    });

  readonly filters =
    this.filtersSignal.asReadonly();

  readonly data =
    this.dataSignal.asReadonly();

  readonly kpis = computed(
    () => this.dataSignal().kpis,
  );

  readonly productionByGreenhouse = computed(
    () => this.dataSignal().productionByGreenhouse,
  );

  readonly productionByProduct = computed(
    () => this.dataSignal().productionByProduct,
  );

  readonly expensesChart = computed(
    () => this.dataSignal().expensesChart,
  );

  updateFilters(
    filters: DashboardFilters,
  ): void {
    this.filtersSignal.set(filters);
  }

  setData(data: DashboardData): void {
    this.dataSignal.set(data);
  }
}