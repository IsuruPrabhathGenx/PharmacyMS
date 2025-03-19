// models/Customer.js
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  documentText: {
    type: String,
    default: null
  },
  documentName: {
    type: String,
    default: null
  },
  documentUploadedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Customer', CustomerSchema);