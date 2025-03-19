// // src/types/expense.ts

// export interface ExpenseCategory {
//     id?: string;
//     name: string;
//     description?: string;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }
  
//   export interface Expense {
//     id?: string;
//     date: Date;
//     amount: number;
//     details: string;
//     categoryId: string;
//     categoryName: string;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }


// src/types/expense.ts

export interface ExpenseCategory {
  _id?: string;     // MongoDB uses _id
  id?: string;      // Keep for compatibility
  name: string;
  description?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Expense {
  _id?: string;     // MongoDB uses _id
  id?: string;      // Keep for compatibility
  date: Date | string;
  amount: number;
  details: string;
  categoryId: string;
  categoryName: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

