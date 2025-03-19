// // src/types/sale.ts
// import { InventoryItem } from './inventory';
// import { BatchWithDetails } from './purchase';

// export interface SaleItem {
//   itemId: string;
//   item: InventoryItem;
//   batchId: string;
//   batch: BatchWithDetails;
//   unitQuantity: number;
//   subUnitQuantity: number;
//   unitPrice: number;
//   subUnitPrice: number;
//   totalPrice: number;
//   totalCost: number;
// }

// export interface Sale {
//   id?: string;
//   items: SaleItem[];
//   totalAmount: number;
//   totalCost: number;
//   saleDate: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }


// // src/types/sale.ts
// import { InventoryItem } from './inventory';
// import { BatchWithDetails } from './purchase';
// import { DoctorFeeSaleItem } from './doctorFee';

// export interface SaleItem {
//   itemId: string;
//   item: InventoryItem;
//   batchId: string;
//   batch: BatchWithDetails;
//   unitQuantity: number;
//   subUnitQuantity: number;
//   unitPrice: number;
//   subUnitPrice: number;
//   totalPrice: number;
//   totalCost: number;
// }

// export interface Sale {
//   id?: string;
//   items: SaleItem[];
//   doctorFees?: DoctorFeeSaleItem[];
//   totalAmount: number;
//   totalCost: number;
//   saleDate: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // src/types/sale.ts
// import { InventoryItem } from './inventory';
// import { BatchWithDetails } from './purchase';
// import { DoctorFeeSaleItem } from './doctorFee';
// import { LaboratoryTestSaleItem } from './laboratoryTest';

// import { Customer } from './customer';

// export interface SaleItem {
//   itemId: string;
//   item: InventoryItem;
//   batchId: string;
//   batch: BatchWithDetails;
//   unitQuantity: number;
//   subUnitQuantity: number;
//   unitPrice: number;
//   subUnitPrice: number;
//   totalPrice: number;
//   totalCost: number;
// }

// // export interface Sale {
// //   id?: string;
// //   items: SaleItem[];
// //   doctorFees?: DoctorFeeSaleItem[];
// //   laboratoryTests?: LaboratoryTestSaleItem[];
// //   totalAmount: number;
// //   totalCost: number;
// //   saleDate: Date;
// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// export interface Sale {
//     id?: string;
//     customerId?: string;
//     customer?: Customer;
//     items: SaleItem[];
//     doctorFees?: DoctorFeeSaleItem[];
//     laboratoryTests?: LaboratoryTestSaleItem[];
//     totalAmount: number;
//     totalCost: number;
//     saleDate: Date;
//     createdAt: Date;
//     updatedAt: Date;
//   }

// src/types/sale.ts
import { InventoryItem } from './inventory';
import { BatchWithDetails } from './purchase';
import { DoctorFeeSaleItem } from './doctorFee';
import { LaboratoryTestSaleItem } from './laboratoryTest';
import { Customer } from './customer';

export interface SaleItem {
  itemId: string;
  item: InventoryItem;
  batchId: string;
  batch: BatchWithDetails;
  unitQuantity: number;
  subUnitQuantity: number;
  unitPrice: number;
  subUnitPrice: number;
  totalPrice: number;
  totalCost: number;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_deposit';

export interface Sale {
  id?: string;
  customerId?: string;
  customer?: Customer;
  items: SaleItem[];
  doctorFees?: DoctorFeeSaleItem[];
  laboratoryTests?: LaboratoryTestSaleItem[];
  totalAmount: number;
  totalCost: number;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod: PaymentMethod;
  bankAccountId?: string; // Optional since it's only required for bank_deposit
  discountPercentage?: number; // New field to store customer discount percentage
  discountAmount?: number; // New field to store the actual discount amount
  appliedDiscount: boolean; // Whether discount was applied to this sale
}