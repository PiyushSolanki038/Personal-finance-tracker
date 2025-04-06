const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    
    if (!category || !amount || !period) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const budget = new Budget({
      userId: req.user.userId,
      category,
      amount,
      period,
      spent: 0
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;