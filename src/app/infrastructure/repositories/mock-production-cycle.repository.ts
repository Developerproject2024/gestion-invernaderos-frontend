import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ProductionCycle } from '../../core/models/production-cycle.model';
import { ProductionCycleRepository } from '../../domain/repositories/production-cycle.repository';
import { MOCK_PRODUCTION_CYCLES } from '../data/mock-production-cycles';

@Injectable()
export class MockProductionCycleRepository extends ProductionCycleRepository {
  private cycles: ProductionCycle[] = [...MOCK_PRODUCTION_CYCLES];

  getAll(): Observable<ProductionCycle[]> {
    return of([...this.cycles]);
  }

  create(
    cycle: Omit<ProductionCycle, 'id'>,
  ): Observable<ProductionCycle> {
    const createdCycle: ProductionCycle = {
      ...cycle,
      id: crypto.randomUUID(),
    };

    this.cycles = [...this.cycles, createdCycle];
    return of(createdCycle);
  }

  update(cycle: ProductionCycle): Observable<ProductionCycle> {
    const index = this.cycles.findIndex((item) => item.id === cycle.id);

    if (index === -1) {
      throw new Error(`Production cycle not found: ${cycle.id}`);
    }

    this.cycles = this.cycles.map((item) =>
      item.id === cycle.id ? { ...cycle } : item,
    );

    return of(cycle);
  }

  delete(id: string): Observable<void> {
    this.cycles = this.cycles.filter((cycle) => cycle.id !== id);
    return of(void 0);
  }
}
