// models/Batch.js
const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true
  },
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Inventory item reference is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: false
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  unitPrice: {
    type: Number,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Compound index to ensure batch numbers are unique per item
BatchSchema.index({ inventoryItem: 1, batchNumber: 1 }, { unique: true });

module.exports = mongoose.model('Batch', BatchSchema);