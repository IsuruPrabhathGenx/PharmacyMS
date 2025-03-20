// src/services/financialReportService.ts
import { Sale } from '@/types/sale';
import { Expense } from '@/types/expense';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface FinancialSummary {
  totalRevenue: number;
  totalInventoryCost: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  salesCount: number;
  expensesCount: number;
}

export interface DailyFinancialData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  expenses: number;
  netProfit: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialReportData {
  summary: FinancialSummary;
  dailyData: DailyFinancialData[];
  expensesByCategory: CategoryExpense[];
  sales: Sale[];
  expenses: Expense[];
}

export const financialReportService = {
  async getFinancialReport(filters?: {
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
  }): Promise<FinancialReportData> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.customerId) params.append('customerId', filters.customerId);
      
      const url = `${API_URL}/financial-reports?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial report data');
      }
      
      const data = await response.json();
      
      // Transform dates in sales and expenses
      if (data.sales) {
        data.sales = data.sales.map((sale: any) => ({
          ...sale,
          id: sale._id,
          saleDate: new Date(sale.saleDate),
          createdAt: new Date(sale.createdAt),
          updatedAt: new Date(sale.updatedAt),
        }));
      }
      
      if (data.expenses) {
        data.expenses = data.expenses.map((expense: any) => ({
          ...expense,
          id: expense._id,
          date: new Date(expense.date),
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date(expense.updatedAt),
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error getting financial report:', error);
      throw error;
    }
  },

  async getFinancialSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
  }): Promise<FinancialSummary> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.customerId) params.append('customerId', filters.customerId);
      
      const url = `${API_URL}/financial-reports/summary?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial summary');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting financial summary:', error);
      throw error;
    }
  },

  async getDailyFinancialData(filters?: {
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
  }): Promise<DailyFinancialData[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.customerId) params.append('customerId', filters.customerId);
      
      const url = `${API_URL}/financial-reports/daily?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily financial data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting daily financial data:', error);
      throw error;
    }
  },

  async getExpensesByCategory(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<CategoryExpense[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      
      const url = `${API_URL}/financial-reports/expenses-by-category?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses by category');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      throw error;
    }
  }
};