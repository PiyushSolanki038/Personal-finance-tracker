const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  profile: {
    name: {
      type: String,
      required: true,
      default: 'User'
    },
    email: {
      type: String,
      required: true,
      default: 'user@example.com'
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    }
  },
  notifications: {
    emailAlerts: { type: Boolean, default: false },
    budgetAlerts: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: false }
  },
  categories: {
    type: [String],
    default: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other']
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);