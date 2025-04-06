const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  currency: { type: String, default: 'USD' },
  theme: { type: String, default: 'light' },
  notifications: { type: Boolean, default: true },
  monthlyBudgetLimit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);