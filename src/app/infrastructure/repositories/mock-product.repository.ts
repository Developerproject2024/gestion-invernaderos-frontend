import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  Product,
  ProductMovement,
} from '../../core/models/product.model';

import {
  MOCK_PRODUCTS,
  MOCK_PRODUCT_MOVEMENTS,
} from '../data/mock-products';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class MockProductRepository
  implements ProductRepository {
  private products: Product[] = [
    ...MOCK_PRODUCTS,
  ];

  private movements: ProductMovement[] = [
    ...MOCK_PRODUCT_MOVEMENTS,
  ];

  getAll(): Observable<Product[]> {
    return of([...this.products]);
  }

  getById(
    id: string,
  ): Observable<Product | null> {
    const product =
      this.products.find(
        (item) => item.id === id,
      ) ?? null;

    return of(product);
  }

  create(
    product: Omit<Product, 'id'>,
  ): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
    };

    this.products.push(newProduct);

    return of(newProduct);
  }

  update(
    product: Product,
  ): Observable<Product> {
    const index =
      this.products.findIndex(
        (item) => item.id === product.id,
      );

    if (index === -1) {
      return of(product);
    }

    this.products[index] = {
      ...product,
    };

    return of(this.products[index]);
  }

  delete(
    id: string,
  ): Observable<void> {
    this.products =
      this.products.filter(
        (item) => item.id !== id,
      );

    return of(void 0);
  }

  getMovements(): Observable<ProductMovement[]> {
    return of([...this.movements]);
  }

  getMovementById(
    id: string,
  ): Observable<ProductMovement | null> {
    const movement =
      this.movements.find(
        (item) => item.id === id,
      ) ?? null;

    return of(movement);
  }

  createMovement(
    movement: Omit<ProductMovement, 'id'>,
  ): Observable<ProductMovement> {
    const newMovement: ProductMovement = {
      ...movement,
      id: crypto.randomUUID(),
    };

    this.movements.push(newMovement);

    return of(newMovement);
  }

  updateMovement(
    movement: ProductMovement,
  ): Observable<ProductMovement> {
    const index =
      this.movements.findIndex(
        (item) => item.id === movement.id,
      );

    if (index === -1) {
      return of(movement);
    }

    this.movements[index] = {
      ...movement,
    };

    return of(this.movements[index]);
  }

  deleteMovement(
    id: string,
  ): Observable<void> {
    this.movements =
      this.movements.filter(
        (item) => item.id !== id,
      );

    return of(void 0);
  }
}