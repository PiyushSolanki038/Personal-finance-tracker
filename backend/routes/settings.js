const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get settings
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = await Setting.create({ userId: req.user.userId });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new Setting({ userId: req.user.userId });
    }
    settings.profile = req.body;
    await settings.save();
    res.json(settings.profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update notification settings
router.put('/notifications', async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    settings.notifications = req.body;
    await settings.save();
    res.json(settings.notifications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add new category
router.post('/categories', async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    if (!settings.categories.includes(req.body.category)) {
      settings.categories.push(req.body.category);
      await settings.save();
    }
    res.json(settings.categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category
router.delete('/categories/:category', async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (settings) {
      settings.categories = settings.categories.filter(c => c !== req.params.category);
      await settings.save();
    }
    res.json(settings.categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;