// routes/bankAccounts.js
const express = require('express');
const router = express.Router();
const BankAccount = require('../models/BankAccount');

// GET all bank accounts
router.get('/', async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find().sort({ bankName: 1 });
    res.json(bankAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active bank accounts
router.get('/active', async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find({ status: 'active' }).sort({ bankName: 1 });
    res.json(bankAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single bank account by ID
router.get('/:id', async (req, res) => {
  try {
    const bankAccount = await BankAccount.findById(req.params.id);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    res.json(bankAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new bank account
router.post('/', async (req, res) => {
  try {
    const bankAccount = new BankAccount(req.body);
    const newBankAccount = await bankAccount.save();
    res.status(201).json(newBankAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a bank account
router.put('/:id', async (req, res) => {
  try {
    const bankAccount = await BankAccount.findById(req.params.id);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        bankAccount[key] = req.body[key];
      }
    });
    
    const updatedBankAccount = await bankAccount.save();
    res.json(updatedBankAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a bank account balance
router.put('/:id/balance', async (req, res) => {
    try {
      const { balance } = req.body;
      
      if (balance === undefined) {
        return res.status(400).json({ message: 'Balance is required' });
      }
      
      const bankAccount = await BankAccount.findById(req.params.id);
      if (!bankAccount) {
        return res.status(404).json({ message: 'Bank account not found' });
      }
      
      bankAccount.balance = Number(balance);
      bankAccount.updatedAt = new Date();
      
      const updatedBankAccount = await bankAccount.save();
      res.json(updatedBankAccount);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// DELETE a bank account
router.delete('/:id', async (req, res) => {
  try {
    const bankAccount = await BankAccount.findById(req.params.id);
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    await bankAccount.deleteOne();
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;