// routes/inventory.js
const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Batch = require('../models/Batch');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ updatedAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new inventory item
router.post('/', async (req, res) => {
  try {
    const item = new Inventory(req.body);
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE an inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Handle unit contains update
    if (req.body.hasUnitContains === false) {
      // Remove unitContains field if hasUnitContains is false
      item.unitContains = undefined;
      item.hasUnitContains = false;
    } else if (req.body.hasUnitContains && req.body.unitContains) {
      item.unitContains = req.body.unitContains;
      item.hasUnitContains = true;
    }
    
    // Update other fields
    if (req.body.code) item.code = req.body.code;
    if (req.body.name) item.name = req.body.name;
    if (req.body.type) item.type = req.body.type;
    if (req.body.minQuantity !== undefined) item.minQuantity = req.body.minQuantity;
    
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an inventory item
router.delete('/:id', async (req, res) => {
  try {
    // Check if the item has associated batches
    const associatedBatches = await Batch.findOne({ inventoryItem: req.params.id });
    if (associatedBatches) {
      return res.status(400).json({ 
        message: 'Cannot delete item with associated batches. Delete the batches first.' 
      });
    }
    
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    await item.deleteOne();
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;