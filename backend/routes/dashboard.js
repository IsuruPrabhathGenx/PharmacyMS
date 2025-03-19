// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Inventory = require('../models/Inventory');
const Batch = require('../models/Batch');
const mongoose = require('mongoose');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format, subDays } = require('date-fns');

// GET dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    // Today date range
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    // Yesterday date range
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);
    
    // Current month date range
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    // Previous month date range
    const prevMonthStart = startOfMonth(subMonths(today, 1));
    const prevMonthEnd = endOfMonth(subMonths(today, 1));
    
    // Get today's sales
    const todaySalesAgg = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Get yesterday's sales for comparison
    const yesterdaySalesAgg = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: yesterdayStart, $lte: yesterdayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Get this month's sales and profit
    const monthSalesAgg = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalCost: { $sum: "$totalCost" }
        }
      }
    ]);
    
    // Get previous month's sales for comparison
    const prevMonthSalesAgg = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Get total purchase cost
    const purchaseCostAgg = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Get low stock items
    const lowStockItems = await Inventory.find()
      .sort({ minQuantity: -1 })
      .limit(5);
    
    // Calculate current stock for each item
    const lowStockWithQty = await Promise.all(lowStockItems.map(async (item) => {
      const batches = await Batch.find({ inventoryItem: item._id });
      const currentStock = batches.reduce((total, batch) => total + batch.quantity, 0);
      
      return {
        ...item.toObject(),
        currentStock
      };
    }));
    
    // Filter to only include items with stock below min quantity
    const actualLowStock = lowStockWithQty.filter(item => item.currentStock < item.minQuantity);
    
    // Extract values from aggregations
    const todaySales = todaySalesAgg.length > 0 ? todaySalesAgg[0].total : 0;
    const yesterdaySales = yesterdaySalesAgg.length > 0 ? yesterdaySalesAgg[0].total : 0;
    const monthSales = monthSalesAgg.length > 0 ? monthSalesAgg[0].totalSales : 0;
    const monthCost = monthSalesAgg.length > 0 ? monthSalesAgg[0].totalCost : 0;
    const prevMonthSales = prevMonthSalesAgg.length > 0 ? prevMonthSalesAgg[0].total : 0;
    const purchaseCost = purchaseCostAgg.length > 0 ? purchaseCostAgg[0].total : 0;
    
    // Calculate metrics
    const monthProfit = monthSales - monthCost;
    const salesGrowth = prevMonthSales > 0 ? ((monthSales - prevMonthSales) / prevMonthSales) * 100 : 0;
    const dailyGrowth = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
    
    res.json({
      todaySales,
      monthSales,
      monthProfit,
      purchaseCost,
      salesGrowth,
      dailyGrowth,
      lowStockItems: actualLowStock
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET chart data for dashboard
router.get('/chart-data', async (req, res) => {
  try {
    const today = new Date();
    const chartData = [];
    
    // Generate data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Get sales data for this month
      const salesData = await Sale.aggregate([
        {
          $match: {
            saleDate: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$totalAmount" },
            totalCost: { $sum: "$totalCost" }
          }
        }
      ]);
      
      // Get purchase data for this month
      const purchaseData = await Purchase.aggregate([
        {
          $match: {
            purchaseDate: { $gte: monthStart, $lte: monthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]);
      
      const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;
      const totalCost = salesData.length > 0 ? salesData[0].totalCost : 0;
      const totalPurchases = purchaseData.length > 0 ? purchaseData[0].total : 0;
      
      chartData.push({
        month: format(monthDate, 'MMM yy'),
        sales: totalSales,
        profit: totalSales - totalCost,
        purchases: totalPurchases
      });
    }
    
    res.json(chartData);
  } catch (error) {
    console.error('Error getting chart data:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET payment method stats
router.get('/payment-methods', async (req, res) => {
  try {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    // Aggregate sales by payment method
    const paymentMethodStats = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Calculate total for percentage
    const totalSales = paymentMethodStats.reduce((sum, method) => sum + method.total, 0);
    
    // Transform into required format with colors
    const formattedStats = paymentMethodStats.map((stat, index) => {
      // Default colors based on payment method
      let fill = '#6366f1'; // Default for others
      
      if (stat._id === 'cash') {
        fill = '#6366f1'; // Blue for cash
      } else if (stat._id === 'card') {
        fill = '#8b5cf6'; // Purple for card
      } else if (stat._id === 'bank_deposit') {
        fill = '#ec4899'; // Pink for bank
      }
      
      return {
        name: stat._id ? stat._id.charAt(0).toUpperCase() + stat._id.slice(1).replace('_', ' ') : 'Unknown',
        value: totalSales > 0 ? Math.round((stat.total / totalSales) * 100) : 0,
        fill
      };
    });
    
    // If no data available, return some default values
    if (formattedStats.length === 0) {
      res.json([
        { name: 'Cash', value: 65, fill: '#6366f1' },
        { name: 'Card', value: 25, fill: '#8b5cf6' },
        { name: 'Bank', value: 10, fill: '#ec4899' }
      ]);
    } else {
      res.json(formattedStats);
    }
  } catch (error) {
    console.error('Error getting payment method stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET profit metrics
router.get('/profit-metrics', async (req, res) => {
  try {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    // Get this month's sales and profit
    const monthSalesAgg = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalCost: { $sum: "$totalCost" }
        }
      }
    ]);
    
    // Get total purchase cost
    const purchaseCostAgg = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    // Extract values from aggregations
    const monthSales = monthSalesAgg.length > 0 ? monthSalesAgg[0].totalSales : 0;
    const monthCost = monthSalesAgg.length > 0 ? monthSalesAgg[0].totalCost : 0;
    const purchaseCost = purchaseCostAgg.length > 0 ? purchaseCostAgg[0].total : 0;
    
    // Calculate metrics
    const grossProfit = monthSales - monthCost;
    const grossMargin = monthSales > 0 ? (grossProfit / monthSales) * 100 : 0;
    const netProfit = grossProfit * 0.75; // Assuming 25% additional expenses
    const netProfitMargin = monthSales > 0 ? (netProfit / monthSales) * 100 : 0;
    const roi = purchaseCost > 0 ? (grossProfit / purchaseCost) * 100 : 0;
    
    res.json({
      grossMargin,
      netProfit: netProfitMargin,
      roi
    });
  } catch (error) {
    console.error('Error getting profit metrics:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET low stock items
router.get('/low-stock', async (req, res) => {
  try {
    // Get all inventory items with min quantity defined
    const inventoryItems = await Inventory.find({ minQuantity: { $gt: 0 } });
    
    // Calculate current stock for each item
    const itemsWithStock = await Promise.all(inventoryItems.map(async (item) => {
      const batches = await Batch.find({ inventoryItem: item._id });
      const currentStock = batches.reduce((total, batch) => total + batch.quantity, 0);
      
      return {
        ...item.toObject(),
        currentStock
      };
    }));
    
    // Filter to only include items with stock below min quantity
    const lowStockItems = itemsWithStock
      .filter(item => item.currentStock < item.minQuantity)
      .sort((a, b) => (a.minQuantity - a.currentStock) - (b.minQuantity - b.currentStock))
      .slice(0, 5);
    
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error getting low stock items:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;