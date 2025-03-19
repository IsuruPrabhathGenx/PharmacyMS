
// routes/sales.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const BankAccount = require('../models/BankAccount');
const mongoose = require('mongoose');

// GET all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('customer')
      .populate({
        path: 'items.inventoryItem',
        model: 'Inventory'
      })
      .populate({
        path: 'items.batch',
        model: 'Batch'
      })
      .sort({ createdAt: -1 });
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate({
        path: 'items.inventoryItem',
        model: 'Inventory'
      })
      .populate({
        path: 'items.batch',
        model: 'Batch'
      });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new sale
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      items, 
      doctorFees, 
      laboratoryTests, 
      totalAmount, 
      totalCost, 
      saleDate, 
      paymentMethod, 
      customerId, 
      bankAccountId,
      discountPercentage,
      discountAmount,
      appliedDiscount
    } = req.body;
    
    // Validate customer if provided
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Customer not found' });
      }
    }
    
    // Validate bank account if payment method is bank_deposit
    if (paymentMethod === 'bank_deposit') {
      if (!bankAccountId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Bank account is required for bank deposit payments' });
      }
      
      const bankAccount = await BankAccount.findById(bankAccountId);
      if (!bankAccount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Bank account not found' });
      }
    }
    
    // Verify and update batch quantities
    for (const item of items) {
      const batch = await Batch.findById(item.batch).session(session);
      if (!batch) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Batch not found: ${item.batch}` });
      }
      
      // Get inventory item to check unitContains
      const inventoryItem = await Inventory.findById(item.inventoryItem);
      if (!inventoryItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Inventory item not found: ${item.inventoryItem}` });
      }
      
      // Calculate total units sold
      let totalUnitsSold;
      if (inventoryItem.hasUnitContains && inventoryItem.unitContains) {
        totalUnitsSold = (item.unitQuantity * inventoryItem.unitContains.value) + item.subUnitQuantity;
      } else {
        totalUnitsSold = item.unitQuantity;
      }
      
      // Check if we have enough in stock
      if (batch.quantity < totalUnitsSold) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: `Insufficient quantity in batch ${batch.batchNumber}. Available: ${batch.quantity}, Required: ${totalUnitsSold}` 
        });
      }
      
      // Update batch quantity
      batch.quantity -= totalUnitsSold;
      await batch.save({ session });
    }
    
    // Update bank account balance if payment method is bank_deposit
    if (paymentMethod === 'bank_deposit') {
      const bankAccount = await BankAccount.findById(bankAccountId).session(session);
      bankAccount.balance = (bankAccount.balance || 0) + totalAmount;
      await bankAccount.save({ session });
    }
    
    // Create the sale
    const sale = new Sale({
      customer: customerId || null,
      items,
      doctorFees: doctorFees || [],
      laboratoryTests: laboratoryTests || [],
      totalAmount,
      totalCost,
      saleDate,
      paymentMethod,
      bankAccountId: paymentMethod === 'bank_deposit' ? bankAccountId : undefined,
      discountPercentage: discountPercentage || 0,
      discountAmount: discountAmount || 0,
      appliedDiscount: appliedDiscount || false
    });
    
    const savedSale = await sale.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json(savedSale);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a sale customer
router.put('/:id/customer', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    sale.customer = customerId;
    await sale.save();
    
    res.json({ message: 'Sale updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a sale (with careful validation)
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Restore batch quantities
    for (const item of sale.items) {
      const batch = await Batch.findById(item.batch).session(session);
      if (batch) {
        const inventoryItem = await Inventory.findById(item.inventoryItem);
        if (inventoryItem) {
          let totalUnitsSold;
          if (inventoryItem.hasUnitContains && inventoryItem.unitContains) {
            totalUnitsSold = (item.unitQuantity * inventoryItem.unitContains.value) + item.subUnitQuantity;
          } else {
            totalUnitsSold = item.unitQuantity;
          }
          
          batch.quantity += totalUnitsSold;
          await batch.save({ session });
        }
      }
    }
    
    // Restore bank account balance if payment was bank_deposit
    if (sale.paymentMethod === 'bank_deposit' && sale.bankAccountId) {
      const bankAccount = await BankAccount.findById(sale.bankAccountId).session(session);
      if (bankAccount) {
        bankAccount.balance = (bankAccount.balance || 0) - sale.totalAmount;
        await bankAccount.save({ session });
      }
    }
    
    await sale.deleteOne({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;