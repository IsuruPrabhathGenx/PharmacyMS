// export interface Supplier {
//     id?: string;
//     name: string;
//     phone: string;
//     email?: string;
//     address?: string;
//     contactPerson?: string;
//     notes?: string;
//     status: 'active' | 'inactive';
//     createdAt: Date;
//     updatedAt: Date;
//   }\


// Frontend: types/supplier.ts
export interface Supplier {
  _id?: string;     // MongoDB uses _id
  id?: string;      // Keep for compatibility
  name: string;
  phone: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date | string;
  updatedAt: Date | string;
}