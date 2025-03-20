// src/services/bankAccountService.ts
import { BankAccount } from '@/types/bankAccount';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const bankAccountService = {
  async getAll(): Promise<BankAccount[]> {
    try {
      const response = await fetch(`${API_URL}/bankAccounts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bank accounts');
      }
      
      const data = await response.json();
      
      // Map MongoDB _id to id for compatibility with existing code
      return data.map((account: any) => ({
        ...account,
        id: account._id,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt)
      }));
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      throw error;
    }
  },
  
  async getActive(): Promise<BankAccount[]> {
    try {
      const response = await fetch(`${API_URL}/bankAccounts/active`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch active bank accounts');
      }
      
      const data = await response.json();
      
      // Map MongoDB _id to id for compatibility with existing code
      return data.map((account: any) => ({
        ...account,
        id: account._id,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt)
      }));
    } catch (error) {
      console.error('Error getting active bank accounts:', error);
      throw error;
    }
  },
  
  async create(account: Omit<BankAccount, 'id' | '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const accountData = {
        ...account,
        status: account.status || 'active', // Default to active if not provided
        balance: Number(account.balance) || 0
      };

      const response = await fetch(`${API_URL}/bankAccounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create bank account');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  },
  
  async update(id: string, account: Partial<Omit<BankAccount, 'id' | '_id' | 'createdAt' | 'updatedAt'>>) {
    try {
      // Ensure balance is a number if provided
      const accountData = {
        ...account,
        ...(account.balance !== undefined && {
          balance: Number(account.balance)
        })
      };

      const response = await fetch(`${API_URL}/bankAccounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bank account');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating bank account:', error);
      throw error;
    }
  },
  
  async delete(id: string) {
    try {
      const response = await fetch(`${API_URL}/bankAccounts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bank account');
      }
    } catch (error) {
      console.error('Error deleting bank account:', error);
      throw error;
    }
  },
  
  async updateBalance(id: string, newBalance: number) {
    try {
      const response = await fetch(`${API_URL}/bankAccounts/${id}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance: Number(newBalance) }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bank account balance');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating bank account balance:', error);
      throw error;
    }
  }
};