// routes/expenseCategories.js
const express = require('express');
const router = express.Router();
const ExpenseCategory = require('../models/ExpenseCategory');
const Expense = require('../models/Expense');

// GET all expense categories
router.get('/', async (req, res) => {
  try {
    const categories = await ExpenseCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single expense category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await ExpenseCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new expense category
router.post('/', async (req, res) => {
  try {
    const category = new ExpenseCategory({
      name: req.body.name,
      description: req.body.description
    });
    
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE an expense category
router.put('/:id', async (req, res) => {
  try {
    const category = await ExpenseCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    if (req.body.name !== undefined) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    
    const updatedCategory = await category.save();
    
    // Update category name in all expenses using this category
    if (req.body.name !== undefined && req.body.name !== category.name) {
      await Expense.updateMany(
        { categoryId: req.params.id },
        { categoryName: req.body.name }
      );
    }
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an expense category
router.delete('/:id', async (req, res) => {
  try {
    // Check if any expenses are using this category
    const expenseCount = await Expense.countDocuments({ categoryId: req.params.id });
    if (expenseCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category that is used by ${expenseCount} expenses. Update or delete these expenses first.` 
      });
    }
    
    const category = await ExpenseCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;