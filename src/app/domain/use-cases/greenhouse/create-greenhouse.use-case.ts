import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { GreenhouseRepository } from '../../repositories/greenhouse.repository';

@Injectable({
  providedIn: 'root',
})
export class CreateGreenhouseUseCase {
  private readonly greenhouseRepository = inject(
    GreenhouseRepository,
  );

  execute(
    greenhouse: Omit<Greenhouse, 'id'>,
  ): Observable<Greenhouse> {
    return this.greenhouseRepository.create(greenhouse);
  }
}