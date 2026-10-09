import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { GreenhouseRepository } from '../../repositories/greenhouse.repository';

@Injectable({
  providedIn: 'root',
})
export class GetGreenhousesUseCase {
  private readonly greenhouseRepository = inject(
    GreenhouseRepository,
  );

  execute(): Observable<Greenhouse[]> {
    return this.greenhouseRepository.getAll();
  }
}