import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductMovementFormComponent } from './product-movement-form.component';

describe('ProductMovementFormComponent', () => {
  let component: ProductMovementFormComponent;
  let fixture: ComponentFixture<ProductMovementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMovementFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductMovementFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
