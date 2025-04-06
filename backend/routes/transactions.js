const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new transaction
router.post('/', async (req, res) => {
  const transaction = new Transaction({
    description: req.body.description,
    amount: req.body.amount,
    type: req.body.type,
    category: req.body.category,
    date: req.body.date
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get transaction summary
router.get('/summary', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const summary = {
      totalIncome: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    };
    summary.currentBalance = summary.totalIncome - summary.totalExpenses;

    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5);

    res.json({ summary, recentTransactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;