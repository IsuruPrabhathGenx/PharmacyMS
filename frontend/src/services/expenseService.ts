// src/services/expenseService.ts

import { Expense, ExpenseCategory } from '@/types/expense';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const expenseService = {
  // Expense CRUD operations
  async createExpense(expense: Omit<Expense, 'id' | '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create expense');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  async updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | '_id' | 'createdAt' | 'updatedAt'>>) {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update expense');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  async deleteExpense(id: string) {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  async getAllExpenses() {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const data = await response.json();
      
      // Map MongoDB _id to id for compatibility with existing code
      return data.map((expense: any) => ({
        ...expense,
        id: expense._id,
        date: new Date(expense.date)
      }));
    } catch (error) {
      console.error("Error getting expenses:", error);
      throw error;
    }
  },

  // Category CRUD operations
  async createCategory(category: Omit<ExpenseCategory, 'id' | '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await fetch(`${API_URL}/expense-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<Omit<ExpenseCategory, 'id' | '_id' | 'createdAt' | 'updatedAt'>>) {
    try {
      const response = await fetch(`${API_URL}/expense-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const response = await fetch(`${API_URL}/expense-categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  async getAllCategories() {
    try {
      const response = await fetch(`${API_URL}/expense-categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      
      // Map MongoDB _id to id for compatibility with existing code
      return data.map((category: any) => ({
        ...category,
        id: category._id
      }));
    } catch (error) {
      console.error("Error getting categories:", error);
      throw error;
    }
  }
};