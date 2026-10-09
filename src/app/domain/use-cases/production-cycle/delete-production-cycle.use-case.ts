import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductionCycleRepository } from '../../repositories/production-cycle.repository';

@Injectable({ providedIn: 'root' })
export class DeleteProductionCycleUseCase {
  private readonly repository = inject(ProductionCycleRepository);

  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
