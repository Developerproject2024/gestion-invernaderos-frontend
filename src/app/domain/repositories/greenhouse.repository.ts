import { Observable } from 'rxjs';

import { Greenhouse } from '../../core/models/greenhouse.model';

export abstract class GreenhouseRepository {
  abstract getAll(): Observable<Greenhouse[]>;

  abstract getById(id: string): Observable<Greenhouse | null>;

  abstract create(
    greenhouse: Omit<Greenhouse, 'id'>,
  ): Observable<Greenhouse>;

  abstract update(greenhouse: Greenhouse): Observable<Greenhouse>;

  abstract delete(id: string): Observable<void>;
}