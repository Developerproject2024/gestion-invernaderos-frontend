import { ProductionCycle } from '../../core/models/production-cycle.model';

export const MOCK_PRODUCTION_CYCLES: ProductionCycle[] = [
  {
    id: 'cycle-001',
    greenhouseId: 'greenhouse-001',
    name: 'Ciclo 1 - 2026',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    status: 'COMPLETED',
  },
  {
    id: 'cycle-002',
    greenhouseId: 'greenhouse-001',
    name: 'Ciclo 2 - 2026',
    startDate: '2026-07-15',
    endDate: '2026-12-20',
    status: 'ACTIVE',
  },
  {
    id: 'cycle-003',
    greenhouseId: 'greenhouse-002',
    name: 'Ciclo 1 - 2026',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    status: 'COMPLETED',
  },
  {
    id: 'cycle-004',
    greenhouseId: 'greenhouse-002',
    name: 'Ciclo 2 - 2026',
    startDate: '2026-07-15',
    endDate: '2026-12-20',
    status: 'ACTIVE',
  },
  {
    id: 'cycle-005',
    greenhouseId: 'greenhouse-003',
    name: 'Ciclo 1 - 2026',
    startDate: '2026-07-01',
    endDate: '2026-12-20',
    status: 'ACTIVE',
  },
];
