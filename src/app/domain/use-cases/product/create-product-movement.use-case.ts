import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductMovement } from '../../../core/models/product.model';
import { ProductRepository } from '../../repositories/product.repository';

@Injectable({
  providedIn: 'root',
})
export class CreateProductMovementUseCase {
  private readonly productRepository = inject(
    ProductRepository,
  );

  execute(
    movement: Omit<ProductMovement, 'id'>,
  ): Observable<ProductMovement> {
    return this.productRepository.createMovement(movement);
  }
}