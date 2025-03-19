// src/services/salesReportService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SalesSummary {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  saleCount: number;
  totalItems: number;
  profitMargin: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  sales: number;
  cost: number;
  profit: number;
  count: number;
}

export interface TopSellingItem {
  itemId: string;
  itemName: string;
  itemCode: string;
  totalQuantity: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  occurrenceCount: number;
}

export interface CustomerReport {
  customerId: string;
  customerName: string;
  customerMobile: string;
  totalSpent: number;
  purchaseCount: number;
  lastPurchaseDate: string;
  averagePurchaseValue: number;
}

export interface DateRangeReport {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  saleCount: number;
  itemCount: number;
  startDate: string;
  endDate: string;
  rangeName: string;
}

export const salesReportService = {
    async getSalesSummary(filters?: {
        startDate?: Date;
        endDate?: Date;
        customerId?: string;
        itemId?: string;
      }): Promise<SalesSummary> {
        try {
          // Build query parameters
          const params = new URLSearchParams();
          if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
          if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
          if (filters?.customerId) params.append('customerId', filters.customerId);
          if (filters?.itemId) params.append('itemId', filters.itemId);
          
          const queryString = params.toString();
          // Fix: Ensure there's a ? between the URL and query parameters when there are parameters
          const url = `${API_URL}/sales-reports/summary${queryString ? `?${queryString}` : ''}`;
          
          console.log('Fetching sales summary from:', url); // Add for debugging
          
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error('Response status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to fetch sales summary');
          }
          
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error getting sales summary:', error);
          throw error;
        }
      },
  
  async getTimeSeriesData(interval: 'day' | 'week' | 'month', filters?: {
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
    itemId?: string;
  }): Promise<TimeSeriesDataPoint[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('interval', interval);
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.itemId) params.append('itemId', filters.itemId);
      
      const url = `${API_URL}/sales-reports/time-series?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch time series data');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting time series data:', error);
      throw error;
    }
  },
  
  async getTopSellingItems(filters?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<TopSellingItem[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const url = `${API_URL}/sales-reports/top-items?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch top selling items');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting top selling items:', error);
      throw error;
    }
  },
  
  async getDateRangeReport(range: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'lastYear' | 'all'): Promise<DateRangeReport> {
    try {
      const url = `${API_URL}/sales-reports/date-range?range=${range}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch date range report');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting date range report:', error);
      throw error;
    }
  },
  
  async getCustomerReport(filters?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<CustomerReport[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const url = `${API_URL}/sales-reports/customers?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer report');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting customer report:', error);
      throw error;
    }
  }
};