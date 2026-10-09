export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  value: number;
  status: ProductStatus;
}

export interface ProductMovementPayment {
  id: string;
  date: string;
  amount: number;
}

export interface ProductMovement {
  id: string;
  date: string;
  greenhouseId: string;
  productionCycleId: string;
  productId: string;
  quantity: number;   // Kilos producidos
  unitValue: number;  // Valor por kilo
  totalValue: number; // Kilos × valor por kilo
  payments?: ProductMovementPayment[];
}