import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  Product,
  ProductMovement,
} from '../../../core/models/product.model';

import { Greenhouse } from '../../../core/models/greenhouse.model';
import { ProductionCycle } from '../../../core/models/production-cycle.model';

import { CreateProductMovementUseCase } from '../../../domain/use-cases/product/create-product-movement.use-case';

import { UpdateProductMovementUseCase } from '../../../domain/use-cases/product/update-product-movement.use-case';

@Component({
  selector: 'app-product-movement-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './product-movement-form.component.html',
  styleUrl: './product-movement-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductMovementFormComponent {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly createMovementUseCase =
    inject(CreateProductMovementUseCase);

  private readonly updateMovementUseCase =
    inject(UpdateProductMovementUseCase);

  readonly products =
    input<Product[]>([]);

  readonly greenhouses =
    input<Greenhouse[]>([]);

  readonly productionCycles =
    input<ProductionCycle[]>([]);

  readonly movement =
    input<ProductMovement | null>(null);

  readonly saved =
    output<ProductMovement>();

  readonly cancelled =
    output<void>();

  readonly form =
    this.formBuilder.nonNullable.group({
      date: [
        '',
        Validators.required,
      ],

      productId: [
        '',
        Validators.required,
      ],

      greenhouseId: [
        '',
        Validators.required,
      ],

      productionCycleId: [
        '',
        Validators.required,
      ],

      quantity: [
        0,
        [
          Validators.required,
          Validators.min(0.01),
        ],
      ],
    });

  private readonly selectedProductId = toSignal(
    this.form.controls.productId.valueChanges,
    { initialValue: this.form.controls.productId.value },
  );

  private readonly quantity = toSignal(
    this.form.controls.quantity.valueChanges,
    { initialValue: this.form.controls.quantity.value },
  );

  private readonly selectedGreenhouseId = toSignal(
    this.form.controls.greenhouseId.valueChanges,
    { initialValue: this.form.controls.greenhouseId.value },
  );

  readonly availableCycles = computed(() => {
    const currentCycleId = this.movement()?.productionCycleId;

    return this.productionCycles().filter(
      (cycle) =>
        cycle.greenhouseId === this.selectedGreenhouseId() &&
        (cycle.status === 'ACTIVE' || cycle.id === currentCycleId),
    );
  });

  readonly selectedProduct =
    computed(() => {
      const productId = this.selectedProductId();

      return (
        this.products().find(
          (product) =>
            product.id === productId,
        ) ?? null
      );
    });

  readonly unitValue =
    computed(
      () =>
        this.selectedProduct()?.value ??
        0,
    );

  readonly totalValue =
    computed(() => {
      return this.quantity() * this.unitValue();
    });

  readonly isEditMode =
    computed(
      () => this.movement() !== null,
    );

  constructor() {
    /*
     * El movimiento y los productos pueden
     * llegar después de crear el componente.
     *
     * Por eso no dependemos solamente de
     * ngOnInit().
     */
    effect(() => {
      const movement =
        this.movement();

      const products =
        this.products();

      const greenhouses =
        this.greenhouses();

      /*
       * Esperamos a tener los datos
       * necesarios para editar.
       */
      if (
        movement &&
        products.length > 0 &&
        greenhouses.length > 0
      ) {
        this.form.patchValue(
          {
            date: movement.date,

            productId:
              movement.productId,

            greenhouseId:
              movement.greenhouseId,

            productionCycleId:
              movement.productionCycleId,

            quantity:
              movement.quantity,
          },
          {
            emitEvent: true,
          },
        );

        return;
      }

      /*
       * Nuevo registro.
       */
      if (
        !movement &&
        products.length > 0 &&
        greenhouses.length > 0
      ) {
        /*
         * Solo establecemos fecha si
         * todavía no existe.
         */
        if (
          !this.form.controls.date.value
        ) {
          this.form.patchValue({
            date: this.getToday(),
          });
        }
      }
    });
  }

  onGreenhouseChange(): void {
    this.form.controls.productionCycleId.reset('');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    const product =
      this.products().find(
        (item) =>
          item.id ===
          value.productId,
      );

    if (!product) {
      return;
    }

    const unitValue =
      product.value;

    const totalValue =
      value.quantity *
      unitValue;

    const currentMovement =
      this.movement();

    /*
     * EDITAR
     */
    if (currentMovement) {
      const updatedMovement:
        ProductMovement = {
        id:
          currentMovement.id,

        payments:
          currentMovement.payments ?? [],

        date:
          value.date,

        productId:
          value.productId,

        greenhouseId:
          value.greenhouseId,

        productionCycleId:
          value.productionCycleId,

        quantity:
          value.quantity,

        unitValue,

        totalValue,
      };

      this.updateMovementUseCase
        .execute(updatedMovement)
        .subscribe({
          next: (movement) => {
            this.saved.emit(
              movement,
            );
          },
        });

      return;
    }

    /*
     * CREAR
     */
    this.createMovementUseCase
      .execute({
        payments: [],

        date:
          value.date,

        productId:
          value.productId,

        greenhouseId:
          value.greenhouseId,

        productionCycleId:
          value.productionCycleId,

        quantity:
          value.quantity,

        unitValue,

        totalValue,
      })
      .subscribe({
        next: (movement) => {
          this.saved.emit(
            movement,
          );
        },
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  formatCurrency(
    value: number,
  ): string {
    return new Intl.NumberFormat(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      },
    ).format(value);
  }

  private getToday(): string {
    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        today.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}