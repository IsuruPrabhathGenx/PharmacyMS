// // src/types/bankAccount.ts
// export interface BankAccount {
//     id?: string;
//     bankName: string;
//     accountName: string;
//     accountNumber: string;
//     balance: number;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }

// src/types/bankAccount.ts

export interface BankAccount {
  _id?: string;         // MongoDB ID
  id?: string;          // For compatibility with UI
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName?: string;
  balance?: number;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date | string;  // Support both Date objects and strings
  updatedAt: Date | string;  // Support both Date objects and strings
}