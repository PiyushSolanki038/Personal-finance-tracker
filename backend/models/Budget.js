const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    required: true,
    enum: ['Monthly', 'Weekly', 'Yearly']
  },
  spent: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Budget', budgetSchema);