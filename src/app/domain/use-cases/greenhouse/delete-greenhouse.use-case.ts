import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { GreenhouseRepository } from '../../repositories/greenhouse.repository';

@Injectable({
  providedIn: 'root',
})
export class DeleteGreenhouseUseCase {
  private readonly greenhouseRepository = inject(
    GreenhouseRepository,
  );

  execute(id: string): Observable<void> {
    return this.greenhouseRepository.delete(id);
  }
}