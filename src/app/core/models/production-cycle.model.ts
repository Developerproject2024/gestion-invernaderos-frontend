export type ProductionCycleStatus =
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED';

export interface ProductionCycle {
  id: string;
  greenhouseId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: ProductionCycleStatus;
}
