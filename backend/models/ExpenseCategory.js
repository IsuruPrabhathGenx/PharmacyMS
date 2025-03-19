// models/ExpenseCategory.js
const mongoose = require('mongoose');

const ExpenseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('ExpenseCategory', ExpenseCategorySchema);