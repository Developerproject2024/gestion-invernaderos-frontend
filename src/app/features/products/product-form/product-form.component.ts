import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Product } from '../../../core/models/product.model';

import { CreateProductUseCase } from '../../../domain/use-cases/product/create-product.use-case';
import { UpdateProductUseCase } from '../../../domain/use-cases/product/update-product.use-case';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  private readonly createProductUseCase =
    inject(CreateProductUseCase);

  private readonly updateProductUseCase =
    inject(UpdateProductUseCase);

  readonly product = input<Product | null>(null);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isSaving = signal(false);

  readonly productForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
      ],
    ],

    quantity: [
      0,
      [
        Validators.required,
        Validators.min(0),
      ],
    ],

    value: [
      0,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],

    status: [
      'ACTIVE' as Product['status'],
      Validators.required,
    ],
  });

  constructor() {
    effect(() => {
      const product = this.product();

      if (product) {
        this.productForm.patchValue({
          name: product.name,
          quantity: product.quantity,
          value: product.value,
          status: product.status,
        });

        return;
      }

      this.productForm.reset({
        name: '',
        quantity: 0,
        value: 0,
        status: 'ACTIVE',
      });
    });
  }

  get isEditMode(): boolean {
    return this.product() !== null;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValue = this.productForm.getRawValue();
    const product = this.product();

    if (product) {
      const updatedProduct: Product = {
        id: product.id,
        name: formValue.name.trim(),
        imageUrl: product.imageUrl,
        quantity: formValue.quantity,
        value: formValue.value,
        status: formValue.status,
      };

      this.updateProductUseCase
        .execute(updatedProduct)
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.saved.emit();
          },
          error: () => {
            this.isSaving.set(false);
          },
        });

      return;
    }

    const newProduct: Omit<Product, 'id'> = {
      name: formValue.name.trim(),
      quantity: formValue.quantity,
      value: formValue.value,
      status: formValue.status,
    };

    this.createProductUseCase
      .execute(newProduct)
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}