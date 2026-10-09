import { Observable } from 'rxjs';

import {
  Product,
  ProductMovement,
} from '../../core/models/product.model';

export abstract class ProductRepository {
  abstract getAll(): Observable<Product[]>;

  abstract getById(
    id: string,
  ): Observable<Product | null>;

  abstract create(
    product: Omit<Product, 'id'>,
  ): Observable<Product>;

  abstract update(
    product: Product,
  ): Observable<Product>;

  abstract delete(
    id: string,
  ): Observable<void>;

  abstract getMovements(): Observable<ProductMovement[]>;

  abstract getMovementById(
    id: string,
  ): Observable<ProductMovement | null>;

  abstract createMovement(
    movement: Omit<ProductMovement, 'id'>,
  ): Observable<ProductMovement>;

  abstract updateMovement(
    movement: ProductMovement,
  ): Observable<ProductMovement>;

  abstract deleteMovement(
    id: string,
  ): Observable<void>;
}