import {
  Injectable,
  inject,
} from '@angular/core';

import { Observable } from 'rxjs';

import { ProductRepository } from '../../repositories/product.repository';

@Injectable({
  providedIn: 'root',
})
export class DeleteProductMovementUseCase {
  private readonly productRepository =
    inject(ProductRepository);

  execute(
    id: string,
  ): Observable<void> {
    return this.productRepository.deleteMovement(
      id,
    );
  }
}