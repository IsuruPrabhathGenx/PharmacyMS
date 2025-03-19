// models/Expense.js
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  details: {
    type: String,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseCategory',
    required: [true, 'Category reference is required']
  },
  categoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Expense', ExpenseSchema);