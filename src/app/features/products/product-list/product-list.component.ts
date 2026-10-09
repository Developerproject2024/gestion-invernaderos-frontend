import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Product } from '../../../core/models/product.model';

import { DeleteProductUseCase } from '../../../domain/use-cases/product/delete-product.use-case';
import { GetProductsUseCase } from '../../../domain/use-cases/product/get-products.use-case';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableComponent } from '../../../shared/components/table/table.component';

import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    FormsModule,
    ModalComponent,
    TableComponent,
    ProductFormComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent
  implements OnInit {

  private readonly router =
    inject(Router);

  private readonly getProductsUseCase =
    inject(GetProductsUseCase);

  private readonly deleteProductUseCase =
    inject(DeleteProductUseCase);

  readonly products =
    signal<Product[]>([]);

  readonly showForm =
    signal(false);

  readonly showDeleteModal =
    signal(false);

  readonly selectedProduct =
    signal<Product | null>(null);

  readonly productToDelete =
    signal<Product | null>(null);

  readonly searchFilter = signal('');

  readonly statusFilter = signal('');

  readonly filteredProducts = computed(() => {
    const search = this.searchFilter().trim().toLocaleLowerCase('es');
    const status = this.statusFilter();

    return this.products().filter((product) =>
      (!search || product.name.toLocaleLowerCase('es').includes(search)) &&
      (!status || product.status === status),
    );
  });

  // Paginación
  readonly currentPage =
    signal(1);

  readonly pageSize = 10;

  readonly totalPages = computed(() => {
    const totalItems =
      this.filteredProducts().length;

    return Math.max(
      1,
      Math.ceil(
        totalItems / this.pageSize,
      ),
    );
  });

  readonly paginatedProducts =
    computed(() => {
      const startIndex =
        (this.currentPage() - 1) *
        this.pageSize;

      const endIndex =
        startIndex + this.pageSize;

      return this.filteredProducts().slice(
        startIndex,
        endIndex,
      );
    });

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.currentPage.set(1);

    this.getProductsUseCase
      .execute()
      .subscribe({
        next: (products) => {
          const sortedProducts =
            [...products].sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name,
                  'es',
                ),
            );

          this.products.set(
            sortedProducts,
          );
        },
      });
  }

  onPreviousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update(
      (page) => page - 1,
    );
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchFilter.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
  }

  onNextPage(): void {
    if (
      this.currentPage() >=
      this.totalPages()
    ) {
      return;
    }

    this.currentPage.update(
      (page) => page + 1,
    );
  }

  onCreate(): void {
    this.selectedProduct.set(null);
    this.showForm.set(true);
  }

  onEdit(product: Product): void {
    this.selectedProduct.set(product);
    this.showForm.set(true);
  }

  onDelete(product: Product): void {
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    const product =
      this.productToDelete();

    if (!product) {
      return;
    }

    this.deleteProductUseCase
      .execute(product.id)
      .subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.productToDelete.set(null);
          this.loadProducts();
        },
      });
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
  }

  onFormCancel(): void {
    this.showForm.set(false);
    this.selectedProduct.set(null);
  }

  onFormSaved(): void {
    this.showForm.set(false);
    this.selectedProduct.set(null);
    this.loadProducts();
  }

  formatValue(value: number): string {
    return new Intl.NumberFormat(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      },
    ).format(value);
  }

  onMovements(): void {
    this.router.navigate([
      '/products/movements',
    ]);
  }
}