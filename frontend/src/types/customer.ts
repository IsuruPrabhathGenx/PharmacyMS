// export interface Customer {
//   id?: string;
//   name: string;
//   mobile: string;
//   address: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Customer {
//   id?: string;
//   name: string;
//   mobile: string;
//   address: string;
//   createdAt: Date;
//   updatedAt: Date;
//   documentText?: string;
//   documentName?: string;
//   documentUploadedAt?: Date;
//   discountPercentage?: number; 
// }

// Frontend: types/customer.ts
export interface Customer {
  _id?: string;     // MongoDB uses _id instead of id
  id?: string;      // Keep for compatibility with existing code
  name: string;
  mobile: string;
  address: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  documentText?: string;
  documentName?: string;
  documentUploadedAt?: Date | string;
  discountPercentage?: number | null;
}