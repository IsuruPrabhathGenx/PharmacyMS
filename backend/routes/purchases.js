
// routes/purchases.js
const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Batch = require('../models/Batch');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

// GET all purchases with details
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplier')
      .populate({
        path: 'items.inventoryItem',
        model: 'Inventory'
      })
      .sort({ createdAt: -1 });
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single purchase by ID
router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate({
        path: 'items.inventoryItem',
        model: 'Inventory'
      });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new purchase
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { supplier, items, totalAmount, purchaseDate, invoiceNumber, notes } = req.body;
    
    // Validate supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Validate all inventory items exist
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.inventoryItem);
      if (!inventoryItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Inventory item not found: ${item.inventoryItem}` });
      }
    }
    
    // Create the purchase
    const purchase = new Purchase({
      supplier,
      items,
      totalAmount,
      purchaseDate,
      invoiceNumber,
      notes
    });
    
    const savedPurchase = await purchase.save({ session });
    
    // Create batches for each item
    const batches = [];
    for (const item of items) {
      const batch = new Batch({
        batchNumber: item.batchNumber,
        inventoryItem: item.inventoryItem,
        quantity: item.totalQuantity,
        expiryDate: item.expiryDate,
        purchase: savedPurchase._id,
        costPrice: item.costPricePerUnit,
        unitPrice: item.sellingPricePerUnit,
        supplier: supplier
      });
      
      const savedBatch = await batch.save({ session });
      batches.push(savedBatch);
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      purchase: savedPurchase,
      batches
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a purchase
router.put('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    // Update only allowed fields
    if (req.body.notes !== undefined) purchase.notes = req.body.notes;
    if (req.body.invoiceNumber !== undefined) purchase.invoiceNumber = req.body.invoiceNumber;
    
    const updatedPurchase = await purchase.save();
    res.json(updatedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a purchase (this is dangerous - should check for batches)
router.delete('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check for associated batches
    const batchesExist = await Batch.findOne({ purchase: req.params.id });
    if (batchesExist) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Cannot delete purchase with associated batches. Delete the batches first.' 
      });
    }
    
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    await purchase.deleteOne({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;