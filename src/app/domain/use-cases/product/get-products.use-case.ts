import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../../../core/models/product.model';
import { ProductRepository } from '../../repositories/product.repository';

@Injectable({
  providedIn: 'root',
})
export class GetProductsUseCase {
  private readonly productRepository = inject(
    ProductRepository,
  );

  execute(): Observable<Product[]> {
    return this.productRepository.getAll();
  }
}