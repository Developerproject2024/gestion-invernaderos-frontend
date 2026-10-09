import { Observable } from 'rxjs';

import { ProductionCycle } from '../../core/models/production-cycle.model';

export abstract class ProductionCycleRepository {
  abstract getAll(): Observable<ProductionCycle[]>;

  abstract create(
    cycle: Omit<ProductionCycle, 'id'>,
  ): Observable<ProductionCycle>;

  abstract update(cycle: ProductionCycle): Observable<ProductionCycle>;

  abstract delete(id: string): Observable<void>;
}
