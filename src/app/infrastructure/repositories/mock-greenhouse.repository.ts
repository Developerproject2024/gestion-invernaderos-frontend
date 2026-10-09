import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Greenhouse } from '../../core/models/greenhouse.model';
import { GreenhouseRepository } from '../../domain/repositories/greenhouse.repository';
import { MOCK_GREENHOUSES } from '../data/mock-greenhouses';

@Injectable({
  providedIn: 'root',
})
export class MockGreenhouseRepository extends GreenhouseRepository {
  private greenhouses: Greenhouse[] = [...MOCK_GREENHOUSES];

  override getAll(): Observable<Greenhouse[]> {
    return of([...this.greenhouses]);
  }

  override getById(id: string): Observable<Greenhouse | null> {
    const greenhouse = this.greenhouses.find(
      (item) => item.id === id,
    );

    return of(greenhouse ?? null);
  }

  override create(
    greenhouse: Omit<Greenhouse, 'id'>,
  ): Observable<Greenhouse> {
    const newGreenhouse: Greenhouse = {
      id: `greenhouse-${Date.now()}`,
      ...greenhouse,
    };

    this.greenhouses.push(newGreenhouse);

    return of(newGreenhouse);
  }

  override update(greenhouse: Greenhouse): Observable<Greenhouse> {
    const index = this.greenhouses.findIndex(
      (item) => item.id === greenhouse.id,
    );

    if (index !== -1) {
      this.greenhouses[index] = greenhouse;
    }

    return of(greenhouse);
  }

  override delete(id: string): Observable<void> {
    this.greenhouses = this.greenhouses.filter(
      (item) => item.id !== id,
    );

    return of(void 0);
  }
}