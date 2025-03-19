// src/services/dashboardService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface DashboardSummary {
  todaySales: number;
  monthSales: number;
  monthProfit: number;
  purchaseCost: number;
  salesGrowth: number;
  lowStockItems: any[];
}

export interface ChartDataPoint {
  month: string;
  sales: number;
  profit: number;
  purchases: number;
}

export interface PaymentMethodStats {
  name: string;
  value: number;
  fill: string;
}

export interface ProfitMetrics {
  grossMargin: number;
  netProfit: number;
  roi: number;
}

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await fetch(`${API_URL}/dashboard/summary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      throw error;
    }
  },
  
  async getChartData(): Promise<ChartDataPoint[]> {
    try {
      const response = await fetch(`${API_URL}/dashboard/chart-data`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting chart data:', error);
      throw error;
    }
  },
  
  async getPaymentMethodStats(): Promise<PaymentMethodStats[]> {
    try {
      const response = await fetch(`${API_URL}/dashboard/payment-methods`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment method stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting payment method stats:', error);
      throw error;
    }
  },
  
  async getProfitMetrics(): Promise<ProfitMetrics> {
    try {
      const response = await fetch(`${API_URL}/dashboard/profit-metrics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profit metrics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting profit metrics:', error);
      throw error;
    }
  },
  
  async getLowStockItems(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/dashboard/low-stock`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch low stock items');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting low stock items:', error);
      throw error;
    }
  }
};