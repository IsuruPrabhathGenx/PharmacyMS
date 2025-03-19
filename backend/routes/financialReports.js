// routes/financialReports.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const { startOfDay, endOfDay } = require('date-fns');

// GET comprehensive financial report
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    
    // Build match conditions for filtering
    const saleMatchConditions = {};
    const expenseMatchConditions = {};
    
    // Date filtering
    if (startDate && endDate) {
      const dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      saleMatchConditions.saleDate = dateFilter;
      expenseMatchConditions.date = dateFilter;
    }
    
    // Customer filtering for sales
    if (customerId) {
      try {
        saleMatchConditions.customer = new mongoose.Types.ObjectId(customerId);
      } catch (err) {
        console.error('Invalid customerId format:', customerId);
        saleMatchConditions.customer = new mongoose.Types.ObjectId('000000000000000000000000');
      }
    }
    
    // Get sales data
    const sales = await Sale.find(saleMatchConditions)
      .populate('customer')
      .populate({
        path: 'items.inventoryItem',
        model: 'Inventory'
      })
      .populate({
        path: 'items.batch',
        model: 'Batch'
      })
      .sort({ saleDate: -1 });
    
    // Get expenses data
    const expenses = await Expense.find(expenseMatchConditions)
      .sort({ date: -1 });
    
    // Calculate summary
    const summary = calculateFinancialSummary(sales, expenses);
    
    // Calculate daily data
    const dailyData = calculateDailyData(sales, expenses);
    
    // Calculate expenses by category
    const expensesByCategory = calculateExpensesByCategory(expenses);
    
    res.json({
      summary,
      dailyData,
      expensesByCategory,
      sales,
      expenses
    });
  } catch (error) {
    console.error('Error getting financial report:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET financial summary only
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    
    // Build match conditions for filtering
    const saleMatchConditions = {};
    const expenseMatchConditions = {};
    
    // Date filtering
    if (startDate && endDate) {
      const dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      saleMatchConditions.saleDate = dateFilter;
      expenseMatchConditions.date = dateFilter;
    }
    
    // Customer filtering for sales
    if (customerId) {
      try {
        saleMatchConditions.customer = new mongoose.Types.ObjectId(customerId);
      } catch (err) {
        console.error('Invalid customerId format:', customerId);
        saleMatchConditions.customer = new mongoose.Types.ObjectId('000000000000000000000000');
      }
    }
    
    // Get sales data (only what's needed for summary)
    const sales = await Sale.find(saleMatchConditions);
    
    // Get expenses data (only what's needed for summary)
    const expenses = await Expense.find(expenseMatchConditions);
    
    // Calculate summary
    const summary = calculateFinancialSummary(sales, expenses);
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting financial summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET daily financial data
router.get('/daily', async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    
    // Build match conditions for filtering
    const saleMatchConditions = {};
    const expenseMatchConditions = {};
    
    // Date filtering
    if (startDate && endDate) {
      const dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      saleMatchConditions.saleDate = dateFilter;
      expenseMatchConditions.date = dateFilter;
    }
    
    // Customer filtering for sales
    if (customerId) {
      try {
        saleMatchConditions.customer = new mongoose.Types.ObjectId(customerId);
      } catch (err) {
        console.error('Invalid customerId format:', customerId);
        saleMatchConditions.customer = new mongoose.Types.ObjectId('000000000000000000000000');
      }
    }
    
    // Get sales data
    const sales = await Sale.find(saleMatchConditions);
    
    // Get expenses data
    const expenses = await Expense.find(expenseMatchConditions);
    
    // Calculate daily data
    const dailyData = calculateDailyData(sales, expenses);
    
    res.json(dailyData);
  } catch (error) {
    console.error('Error getting daily financial data:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET expenses by category
router.get('/expenses-by-category', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build match conditions for filtering
    const matchConditions = {};
    
    // Date filtering
    if (startDate && endDate) {
      matchConditions.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get expenses data
    const expenses = await Expense.find(matchConditions);
    
    // Calculate expenses by category
    const expensesByCategory = calculateExpensesByCategory(expenses);
    
    res.json(expensesByCategory);
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate financial summary
function calculateFinancialSummary(sales, expenses) {
  // Calculate revenue and cost from sales
  const salesTotalRevenue = sales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
  );
  
  const salesTotalCost = sales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.totalCost, 0), 0
  );
  
  // Calculate total expenses
  const expensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate profits
  const grossProfit = salesTotalRevenue - salesTotalCost;
  const netProfit = grossProfit - expensesTotal;
  
  // Calculate profit margin
  const profitMargin = salesTotalRevenue > 0 ? (netProfit / salesTotalRevenue) * 100 : 0;
  
  return {
    totalRevenue: salesTotalRevenue,
    totalInventoryCost: salesTotalCost,
    totalExpenses: expensesTotal,
    grossProfit,
    netProfit,
    profitMargin,
    salesCount: sales.length,
    expensesCount: expenses.length
  };
}

// Helper function to calculate daily data
function calculateDailyData(sales, expenses) {
  const dailyData = {};
  
  // Aggregate sales by date
  sales.forEach(sale => {
    const dateKey = sale.saleDate.toISOString().split('T')[0];
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { revenue: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 };
    }
    
    const revenue = sale.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const cost = sale.items.reduce((sum, item) => sum + item.totalCost, 0);
    
    dailyData[dateKey].revenue += revenue;
    dailyData[dateKey].cost += cost;
    dailyData[dateKey].profit += (revenue - cost);
  });
  
  // Add expenses to daily data
  expenses.forEach(expense => {
    const dateKey = expense.date.toISOString().split('T')[0];
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { revenue: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 };
    }
    
    dailyData[dateKey].expenses += expense.amount;
  });
  
  // Calculate net profit for each day
  Object.keys(dailyData).forEach(dateKey => {
    dailyData[dateKey].netProfit = dailyData[dateKey].profit - dailyData[dateKey].expenses;
  });
  
  // Convert to array and sort by date
  return Object.entries(dailyData)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Helper function to calculate expenses by category
function calculateExpensesByCategory(expenses) {
  // Get total expenses amount
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group expenses by category
  const categoryTotals = {};
  
  expenses.forEach(expense => {
    const category = expense.categoryName;
    
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    
    categoryTotals[category] += expense.amount;
  });
  
  // Convert to array with percentages
  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({ 
      category, 
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

module.exports = router;