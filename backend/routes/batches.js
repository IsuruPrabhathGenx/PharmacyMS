// routes/batches.js
const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Inventory = require('../models/Inventory');

// GET all batches
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('inventoryItem')
      .populate('supplier')
      .populate('purchase')
      .sort({ updatedAt: -1 });
    
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET batches by inventory item ID
router.get('/by-item/:itemId', async (req, res) => {
  try {
    const batches = await Batch.find({ inventoryItem: req.params.itemId })
      .populate('supplier')
      .populate('purchase')
      .sort({ expiryDate: 1 });
    
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single batch by ID
router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('inventoryItem')
      .populate('supplier')
      .populate('purchase');
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get the next batch number for an item
router.get('/next-batch-number/:itemId', async (req, res) => {
  try {
    // Check if the inventory item exists
    const inventoryItem = await Inventory.findById(req.params.itemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Find the highest batch number for this item
    const batches = await Batch.find({ inventoryItem: req.params.itemId })
      .select('batchNumber')
      .sort({ batchNumber: -1 })
      .limit(1);
    
    let nextBatchNumber;
    if (batches.length === 0) {
      // No existing batches, start at 001
      nextBatchNumber = '001';
    } else {
      // Increment the highest batch number
      const highestBatch = batches[0].batchNumber;
      const batchNumber = parseInt(highestBatch, 10);
      nextBatchNumber = (batchNumber + 1).toString().padStart(3, '0');
    }
    
    res.json({ batchNumber: nextBatchNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new batch (standalone, not via purchase)
router.post('/', async (req, res) => {
  try {
    // Validate the inventory item exists
    const inventoryItem = await Inventory.findById(req.body.inventoryItem);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    const batch = new Batch(req.body);
    const newBatch = await batch.save();
    
    res.status(201).json(newBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a batch
router.put('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Update allowed fields
    if (req.body.quantity !== undefined) batch.quantity = req.body.quantity;
    if (req.body.expiryDate !== undefined) batch.expiryDate = req.body.expiryDate;
    if (req.body.unitPrice !== undefined) batch.unitPrice = req.body.unitPrice;
    if (req.body.costPrice !== undefined) batch.costPrice = req.body.costPrice;
    
    const updatedBatch = await batch.save();
    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a batch
router.delete('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    await batch.deleteOne();
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;