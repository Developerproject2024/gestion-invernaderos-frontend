import {
  Injectable,
  inject,
} from '@angular/core';

import { Observable } from 'rxjs';

import { ProductMovement } from '../../../core/models/product.model';

import { ProductRepository } from '../../repositories/product.repository';

@Injectable({
  providedIn: 'root',
})
export class UpdateProductMovementUseCase {
  private readonly productRepository =
    inject(ProductRepository);

  execute(
    movement: ProductMovement,
  ): Observable<ProductMovement> {
    return this.productRepository.updateMovement(
      movement,
    );
  }
}