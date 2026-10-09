import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../../../core/models/product.model';
import { ProductRepository } from '../../repositories/product.repository';

@Injectable({
  providedIn: 'root',
})
export class UpdateProductUseCase {
  private readonly productRepository = inject(
    ProductRepository,
  );

  execute(product: Product): Observable<Product> {
    return this.productRepository.update(product);
  }
}