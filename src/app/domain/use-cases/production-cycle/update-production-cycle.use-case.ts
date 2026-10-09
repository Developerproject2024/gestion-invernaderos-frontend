import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductionCycle } from '../../../core/models/production-cycle.model';
import { ProductionCycleRepository } from '../../repositories/production-cycle.repository';

@Injectable({ providedIn: 'root' })
export class UpdateProductionCycleUseCase {
  private readonly repository = inject(ProductionCycleRepository);

  execute(cycle: ProductionCycle): Observable<ProductionCycle> {
    return this.repository.update(cycle);
  }
}
