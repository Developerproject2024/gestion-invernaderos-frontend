import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductMovementListComponent } from './product-movement-list.component';

describe('ProductMovementListComponent', () => {
  let component: ProductMovementListComponent;
  let fixture: ComponentFixture<ProductMovementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMovementListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductMovementListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
