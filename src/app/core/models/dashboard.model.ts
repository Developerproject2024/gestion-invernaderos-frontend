export interface DashboardFilters {
  greenhouseId: string | null;
  productionCycleId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface DashboardKpi {
  totalExpenses: number;
  totalProductionQuantity: number;
  totalProductionValue: number;
  totalNetValue: number;
  totalPaidProduction: number;
  totalPartialPayments: number;
  totalPendingBalance: number;
}

export interface ProductionByGreenhouse {
  greenhouseId: string;
  label: string;
  quantity: number;
  value: number;
}

export interface ProductionByProduct {
  productId: string;
  label: string;
  quantity: number;
  unitValue: number;
  value: number;
}

export interface ExpenseChartData {
  label: string;
  value: number;
}

export interface DashboardData {
  kpis: DashboardKpi;
  productionByGreenhouse: ProductionByGreenhouse[];
  productionByProduct: ProductionByProduct[];
  expensesChart: ExpenseChartData[];
}