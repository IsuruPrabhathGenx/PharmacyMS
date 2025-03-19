// routes/expenses.js
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new expense
router.post('/', async (req, res) => {
  try {
    // Validate if category exists
    const categoryExists = await ExpenseCategory.findById(req.body.categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Create expense
    const expense = new Expense({
      date: req.body.date,
      amount: req.body.amount,
      details: req.body.details,
      categoryId: req.body.categoryId,
      categoryName: categoryExists.name // Use the name from the found category
    });
    
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE an expense
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // If categoryId is updated, verify it exists and update categoryName
    if (req.body.categoryId && req.body.categoryId !== expense.categoryId.toString()) {
      const categoryExists = await ExpenseCategory.findById(req.body.categoryId);
      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found' });
      }
      expense.categoryId = req.body.categoryId;
      expense.categoryName = categoryExists.name;
    }
    
    // Update other fields
    if (req.body.date !== undefined) expense.date = req.body.date;
    if (req.body.amount !== undefined) expense.amount = req.body.amount;
    if (req.body.details !== undefined) expense.details = req.body.details;
    
    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;