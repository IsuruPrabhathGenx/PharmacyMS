// // src/types/inventory.ts

// export type MedicineType = 'Tablet' | 'Syrup' | 'Capsule' | 'Injection' | 'Cream' | 'Ointment' | 'Other';

// export interface UnitMeasurement {
//   value: number;
//   unit: string;
// }

// export const getMedicineTypeUnit = (type: MedicineType): string => {
//   switch (type) {
//     case 'Tablet':
//     case 'Capsule':
//       return 'tablets';
//     case 'Syrup':
//       return 'ml';
//     case 'Injection':
//       return 'ml';
//     case 'Cream':
//     case 'Ointment':
//       return 'g';
//     default:
//       return 'units';
//   }
// };

// // export interface InventoryItem {
// //   id?: string;
// //   code: string;
// //   name: string;
// //   type: MedicineType;
// //   unitContains: UnitMeasurement;
// //   minQuantity: number;
// //   createdAt: Date;
// //   updatedAt: Date;
// // }


// export interface InventoryItem {
//     id?: string;
//     code: string;
//     name: string;
//     type: MedicineType;
//     hasUnitContains: boolean;  // New field to track if unit contains is enabled
//     unitContains?: UnitMeasurement;  // Made optional with ?
//     minQuantity: number;
//     createdAt: Date;
//     updatedAt: Date;
//   }

// src/types/inventory.ts

export type MedicineType = 'Tablet' | 'Syrup' | 'Capsule' | 'Injection' | 'Cream' | 'Ointment' | 'Other';

export interface UnitMeasurement {
  value: number;
  unit: string;
}

export const getMedicineTypeUnit = (type: MedicineType): string => {
  switch (type) {
    case 'Tablet':
    case 'Capsule':
      return 'tablets';
    case 'Syrup':
      return 'ml';
    case 'Injection':
      return 'ml';
    case 'Cream':
    case 'Ointment':
      return 'g';
    default:
      return 'units';
  }
};

export interface InventoryItem {
    _id?: string;         // MongoDB ID
    id?: string;          // Keep for Firebase compatibility
    code: string;
    name: string;
    type: MedicineType;
    hasUnitContains: boolean;  // Field to track if unit contains is enabled
    unitContains?: UnitMeasurement;  // Optional unit measurement
    minQuantity: number;
    createdAt: Date | string;  // Support both Date objects and strings
    updatedAt: Date | string;  // Support both Date objects and strings
}