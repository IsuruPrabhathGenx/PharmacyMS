// models/Inventory.js
const mongoose = require('mongoose');

const UnitMeasurementSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  }
}, { _id: false });

const InventorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Item code is required'],
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Item type is required'],
    enum: ['Tablet', 'Syrup', 'Capsule', 'Injection', 'Cream', 'Ointment', 'Other']
  },
  hasUnitContains: {
    type: Boolean,
    default: false
  },
  unitContains: {
    type: UnitMeasurementSchema,
    required: false
  },
  minQuantity: {
    type: Number,
    required: [true, 'Minimum quantity is required'],
    min: 0
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Inventory', InventorySchema);