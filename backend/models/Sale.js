// models/Sale.js
const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Inventory item reference is required']
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch reference is required']
  },
  unitQuantity: {
    type: Number,
    required: [true, 'Unit quantity is required'],
    min: 0
  },
  subUnitQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  },
  subUnitPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: 0
  }
}, { _id: false });

const DoctorFeeSaleItemSchema = new mongoose.Schema({
  feeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorFee',
    required: [true, 'Doctor fee reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  }
}, { _id: false });

const LaboratoryTestSaleItemSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LaboratoryTest',
    required: [true, 'Laboratory test reference is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  }
}, { _id: false });

const SaleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  items: {
    type: [SaleItemSchema],
    required: [true, 'At least one item is required'],
    validate: {
      validator: function(items) {
        return items.length > 0;
      },
      message: 'Sale must contain at least one item'
    }
  },
  doctorFees: {
    type: [DoctorFeeSaleItemSchema],
    default: []
  },
  laboratoryTests: {
    type: [LaboratoryTestSaleItemSchema],
    default: []
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: 0
  },
  saleDate: {
    type: Date,
    required: [true, 'Sale date is required'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_deposit'],
    default: 'cash'
  },
  bankAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: function() {
      return this.paymentMethod === 'bank_deposit';
    }
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  appliedDiscount: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Sale', SaleSchema);