// Backend: server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');
const inventoryRoutes = require('./routes/inventory');
const batchRoutes = require('./routes/batches');
const purchaseRoutes = require('./routes/purchases');
const salesRoutes = require('./routes/sales');
const salesReportRoutes = require('./routes/salesReports');
const bankAccountRoutes = require('./routes/bankAccounts');
const expenseRoutes = require('./routes/expenses');
const expenseCategoryRoutes = require('./routes/expenseCategories');
const financialReportRoutes = require('./routes/financialReports');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth'); // Added auth routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://172.31.22.244:3000', // Your frontend URL
  credentials: true
}));
// Middleware
app.use(express.json()); // Parse JSON request body



// Routes
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sales-reports', salesReportRoutes);
app.use('/api/bankAccounts', bankAccountRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/financial-reports', financialReportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });