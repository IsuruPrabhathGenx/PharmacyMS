// // src/types/purchase.ts

// import { InventoryItem } from './inventory';
// import { Supplier } from './supplier';

// export interface Batch {
//   id?: string;
//   batchNumber: string;
//   itemId: string;
//   quantity: number;
//   expiryDate: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   unitPrice?: number;
//   costPrice?: number;
//   supplierId?: string;
// }

// export interface PurchaseItem {
//   itemId: string;
//   batchNumber: string;
//   quantity: number;
//   unitsPerPack?: number;
//   totalQuantity: number;
//   expiryDate: Date;
//   costPricePerUnit: number;  
//   sellingPricePerUnit: number;  
// }

// export interface Purchase {
//   id?: string;
//   supplierId: string;
//   supplier?: Supplier;
//   items: PurchaseItem[];
//   totalAmount: number;
//   purchaseDate: Date;
//   invoiceNumber?: string;
//   notes?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface PurchaseWithDetails extends Purchase {
//   supplier: Supplier;
//   items: (PurchaseItem & {
//     item: InventoryItem;
//   })[];
// }

// export interface BatchWithDetails extends Batch {
//   item: InventoryItem;
//   purchase?: Purchase;
//   supplier?: Supplier;
//   sellingPricePerUnit?: number;
//   costPricePerUnit?: number;
// }


// // src/types/purchase.ts
// import { InventoryItem } from './inventory';
// import { Supplier } from './supplier';

// export interface Batch {
//   _id?: string;
//   id?: string;
//   batchNumber: string;
//   inventoryItem: string | InventoryItem; // Changed from itemId to match MongoDB schema
//   quantity: number;
//   expiryDate: Date | string;
//   createdAt: Date | string;
//   updatedAt: Date | string;
//   unitPrice?: number;
//   costPrice?: number;
//   supplier?: string | Supplier; // Changed from supplierId to match MongoDB schema
//   purchase?: string | Purchase;  // Reference to parent purchase
// }

// export interface PurchaseItem {
//   inventoryItem: string | InventoryItem; // Changed from itemId
//   batchNumber: string;
//   quantity: number;
//   unitsPerPack?: number;
//   totalQuantity: number;
//   expiryDate: Date | string;
//   costPricePerUnit: number;  
//   sellingPricePerUnit: number;  
// }

// export interface Purchase {
//   _id?: string;
//   id?: string;
//   supplier: string | Supplier; // Changed from supplierId
//   items: PurchaseItem[];
//   totalAmount: number;
//   purchaseDate: Date | string;
//   invoiceNumber?: string;
//   notes?: string;
//   createdAt: Date | string;
//   updatedAt: Date | string;
// }

// export interface PurchaseWithDetails extends Purchase {
//   supplier: Supplier;
//   items: (PurchaseItem & {
//     inventoryItem: InventoryItem; // Changed from item
//   })[];
// }

// export interface BatchWithDetails extends Batch {
//   inventoryItem: InventoryItem; // Changed from item
//   purchase?: Purchase;
//   supplier?: Supplier;
// }

// src/types/purchase.ts
import { InventoryItem } from './inventory';
import { Supplier } from './supplier';

export interface Batch {
  _id?: string;
  id?: string;
  batchNumber: string;
  inventoryItem: string | InventoryItem; // Reference to inventory item
  itemId?: string; // For compatibility with previous code
  quantity: number;
  expiryDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  unitPrice?: number;
  costPrice?: number;
  supplier?: string | Supplier; // Reference to supplier
  supplierId?: string; // For compatibility
  purchase?: string | Purchase; // Reference to purchase
  purchaseId?: string; // For compatibility
  
  // For compatibility with previous code - will be populated from inventoryItem
  item?: InventoryItem;
}

export interface PurchaseItem {
  inventoryItem: string | InventoryItem; // Reference to inventory item
  itemId?: string; // For compatibility
  batchNumber: string;
  quantity: number;
  unitsPerPack?: number;
  totalQuantity: number;
  expiryDate: Date | string;
  costPricePerUnit: number;  
  sellingPricePerUnit: number;
  
  // For compatibility with previous code - will be populated from inventoryItem
  item?: InventoryItem;
}

export interface Purchase {
  _id?: string;
  id?: string;
  supplier: string | Supplier; // Reference to supplier
  supplierId?: string; // For compatibility
  items: PurchaseItem[];
  totalAmount: number;
  purchaseDate: Date | string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PurchaseWithDetails extends Purchase {
  supplier: Supplier;
  items: (PurchaseItem & {
    item: InventoryItem; // For compatibility with previous code
    inventoryItem: InventoryItem;
  })[];
}

export interface BatchWithDetails extends Batch {
  item: InventoryItem; // For compatibility with previous code
  inventoryItem: InventoryItem;
  purchase?: Purchase;
  supplier?: Supplier;
}