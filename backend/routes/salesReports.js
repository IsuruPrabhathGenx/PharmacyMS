// routes/salesReports.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const mongoose = require('mongoose');
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');

// GET sales summary data (totals, averages)

// router.get('/summary', async (req, res) => {
//     try {
//       const { startDate, endDate, customerId, itemId } = req.query;
      
//       // Build match conditions
//       const matchConditions = {};
      
//       // Date filtering
//       if (startDate && endDate) {
//         matchConditions.saleDate = {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         };
//       }
      
//       // Customer filtering - safely convert to ObjectId
//       if (customerId) {
//         try {
//           matchConditions.customer = new mongoose.Types.ObjectId(customerId);
//         } catch (err) {
//           console.error('Invalid customerId format:', customerId);
//           // Use a non-existent ID to ensure no results rather than error
//           matchConditions.customer = new mongoose.Types.ObjectId('000000000000000000000000');
//         }
//       }
      
//       // Item filtering - safely convert to ObjectId
//       if (itemId) {
//         try {
//           // Use $elemMatch for array fields
//           matchConditions.items = {
//             $elemMatch: {
//               inventoryItem: new mongoose.Types.ObjectId(itemId)
//             }
//           };
//         } catch (err) {
//           console.error('Invalid itemId format:', itemId);
//           // Use a non-existent ID to ensure no results rather than error
//           matchConditions.items = {
//             $elemMatch: {
//               inventoryItem: new mongoose.Types.ObjectId('000000000000000000000000')
//             }
//           };
//         }
//       }
      
//       console.log('Match conditions:', JSON.stringify(matchConditions));
      
//       // Simplified aggregation pipeline to avoid type issues
//       const pipeline = [
//         { $match: matchConditions },
//         {
//           $group: {
//             _id: null,
//             totalSales: { $sum: "$totalAmount" },
//             totalCost: { $sum: "$totalCost" },
//             saleCount: { $sum: 1 }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             totalSales: { $ifNull: ["$totalSales", 0] },
//             totalCost: { $ifNull: ["$totalCost", 0] },
//             totalProfit: { 
//               $subtract: [
//                 { $ifNull: ["$totalSales", 0] }, 
//                 { $ifNull: ["$totalCost", 0] }
//               ] 
//             },
//             saleCount: 1,
//             totalItems: 0, // Simplified to avoid array issues
//             profitMargin: {
//               $cond: {
//                 if: { $gt: [{ $ifNull: ["$totalSales", 0] }, 0] },
//                 then: {
//                   $multiply: [
//                     {
//                       $divide: [
//                         { $subtract: [{ $ifNull: ["$totalSales", 0] }, { $ifNull: ["$totalCost", 0] }] },
//                         { $ifNull: ["$totalSales", 0] }
//                       ]
//                     },
//                     100
//                   ]
//                 },
//                 else: 0
//               }
//             }
//           }
//         }
//       ];
      
//       console.log('Pipeline:', JSON.stringify(pipeline));
      
//       const summary = await Sale.aggregate(pipeline);
      
//       console.log('Summary result:', JSON.stringify(summary));
      
//       res.json(summary[0] || {
//         totalSales: 0,
//         totalCost: 0,
//         totalProfit: 0,
//         saleCount: 0,
//         totalItems: 0,
//         profitMargin: 0
//       });
//     } catch (error) {
//       console.error('Error in summary endpoint:', error);
//       res.status(500).json({ message: error.message });
//     }
//   });

router.get('/summary', async (req, res) => {
    try {
      const { startDate, endDate, customerId, itemId } = req.query;
      
      // Build match conditions
      const matchConditions = {};
      
      // Date filtering
      if (startDate && endDate) {
        matchConditions.saleDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // Customer filtering - safely convert to ObjectId
      if (customerId) {
        try {
          matchConditions.customer = new mongoose.Types.ObjectId(customerId);
        } catch (err) {
          console.error('Invalid customerId format:', customerId);
          // Use a non-existent ID to ensure no results rather than error
          matchConditions.customer = new mongoose.Types.ObjectId('000000000000000000000000');
        }
      }
      
      // Item filtering - safely convert to ObjectId
      if (itemId) {
        try {
          // Use $elemMatch for array fields
          matchConditions.items = {
            $elemMatch: {
              inventoryItem: new mongoose.Types.ObjectId(itemId)
            }
          };
        } catch (err) {
          console.error('Invalid itemId format:', itemId);
          // Use a non-existent ID to ensure no results rather than error
          matchConditions.items = {
            $elemMatch: {
              inventoryItem: new mongoose.Types.ObjectId('000000000000000000000000')
            }
          };
        }
      }
      
      console.log('Match conditions:', JSON.stringify(matchConditions));
      
      // Simplified aggregation pipeline to avoid type issues
      const pipeline = [
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$totalAmount" },
            totalCost: { $sum: "$totalCost" },
            saleCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            totalSales: { $ifNull: ["$totalSales", 0] },
            totalCost: { $ifNull: ["$totalCost", 0] },
            totalProfit: { 
              $subtract: [
                { $ifNull: ["$totalSales", 0] }, 
                { $ifNull: ["$totalCost", 0] }
              ] 
            },
            saleCount: 1,
            // Instead of setting to 0, calculate a dummy value
            totalItems: { $literal: 0 },
            profitMargin: {
              $cond: {
                if: { $gt: [{ $ifNull: ["$totalSales", 0] }, 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: [{ $ifNull: ["$totalSales", 0] }, { $ifNull: ["$totalCost", 0] }] },
                        { $ifNull: ["$totalSales", 0] }
                      ]
                    },
                    100
                  ]
                },
                else: 0
              }
            }
          }
        }
      ];
      
      console.log('Pipeline:', JSON.stringify(pipeline));
      
      const summary = await Sale.aggregate(pipeline);
      
      console.log('Summary result:', JSON.stringify(summary));
      
      res.json(summary[0] || {
        totalSales: 0,
        totalCost: 0,
        totalProfit: 0,
        saleCount: 0,
        totalItems: 0,
        profitMargin: 0
      });
    } catch (error) {
      console.error('Error in summary endpoint:', error);
      res.status(500).json({ message: error.message });
    }
  });

// GET time series data for charts
router.get('/time-series', async (req, res) => {
  try {
    const { interval, startDate, endDate, customerId, itemId } = req.query;
    
    // Build match conditions
    const matchConditions = {};
    
    // Date filtering
    if (startDate && endDate) {
      matchConditions.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Customer filtering
    if (customerId) {
      matchConditions.customer = mongoose.Types.ObjectId(customerId);
    }
    
    // Item filtering
    if (itemId) {
      matchConditions['items.inventoryItem'] = mongoose.Types.ObjectId(itemId);
    }

    // Set up time grouping based on interval
    let dateFormat;
    if (interval === 'day') {
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
    } else if (interval === 'week') {
      // Group by the week of the year
      dateFormat = {
        $concat: [
          { $toString: { $year: '$saleDate' } },
          '-W',
          { $toString: { $week: '$saleDate' } }
        ]
      };
    } else if (interval === 'month') {
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$saleDate' } };
    } else {
      // Default to day
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
    }
    
    // Aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: '$totalAmount' },
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          sales: { $round: ['$totalSales', 2] },
          cost: { $round: ['$totalCost', 2] },
          profit: { $round: [{ $subtract: ['$totalSales', '$totalCost'] }, 2] },
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ];
    
    const timeSeriesData = await Sale.aggregate(pipeline);
    
    res.json(timeSeriesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET top selling items
router.get('/top-items', async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    // Build match conditions
    const matchConditions = {};
    
    // Date filtering
    if (startDate && endDate) {
      matchConditions.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const pipeline = [
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'inventories',
          localField: 'items.inventoryItem',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $group: {
          _id: '$items.inventoryItem',
          itemName: { $first: '$itemDetails.name' },
          itemCode: { $first: '$itemDetails.code' },
          totalQuantity: { $sum: '$items.unitQuantity' },
          totalSales: { $sum: '$items.totalPrice' },
          totalCost: { $sum: '$items.totalCost' },
          occurrenceCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          itemId: '$_id',
          itemName: 1,
          itemCode: 1,
          totalQuantity: 1,
          totalSales: { $round: ['$totalSales', 2] },
          totalCost: { $round: ['$totalCost', 2] },
          totalProfit: { $round: [{ $subtract: ['$totalSales', '$totalCost'] }, 2] },
          occurrenceCount: 1
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: parseInt(limit) }
    ];
    
    const topItems = await Sale.aggregate(pipeline);
    
    res.json(topItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET predefined date range reports
router.get('/date-range', async (req, res) => {
  try {
    const { range } = req.query;
    const now = new Date();
    
    let startDate, endDate;
    
    switch (range) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'thisWeek':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'thisYear':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = startOfDay(yesterday);
        endDate = endOfDay(yesterday);
        break;
      case 'lastWeek':
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        startDate = startOfWeek(lastWeek);
        endDate = endOfWeek(lastWeek);
        break;
      case 'lastMonth':
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'lastYear':
        const lastYear = new Date(now);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        startDate = startOfYear(lastYear);
        endDate = endOfYear(lastYear);
        break;
      default:
        startDate = new Date(0); // Beginning of time
        endDate = now;
    }
    
    // Build match condition for date range
    const matchCondition = {
      saleDate: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    // Aggregation pipeline
    const pipeline = [
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalCost: { $sum: '$totalCost' },
          saleCount: { $sum: 1 },
          itemCount: { $sum: { $size: '$items' } }
        }
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalCost: 1,
          totalProfit: { $subtract: ['$totalSales', '$totalCost'] },
          saleCount: 1,
          itemCount: 1,
          startDate: { $literal: startDate },
          endDate: { $literal: endDate },
          rangeName: { $literal: range }
        }
      }
    ];
    
    const report = await Sale.aggregate(pipeline);
    
    res.json(report[0] || {
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      saleCount: 0,
      itemCount: 0,
      startDate,
      endDate,
      rangeName: range
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET customer purchase reports
router.get('/customers', async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    // Build match conditions
    const matchConditions = {};
    
    // Date filtering
    if (startDate && endDate) {
      matchConditions.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Only include sales with customers (not walk-ins)
    matchConditions.customer = { $exists: true, $ne: null };
    
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' },
      {
        $group: {
          _id: '$customer',
          customerName: { $first: '$customerInfo.name' },
          customerMobile: { $first: '$customerInfo.mobile' },
          totalSpent: { $sum: '$totalAmount' },
          purchaseCount: { $sum: 1 },
          lastPurchaseDate: { $max: '$saleDate' }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: '$_id',
          customerName: 1,
          customerMobile: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          purchaseCount: 1,
          lastPurchaseDate: 1,
          averagePurchaseValue: { $round: [{ $divide: ['$totalSpent', '$purchaseCount'] }, 2] }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ];
    
    const customerReport = await Sale.aggregate(pipeline);
    
    res.json(customerReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;