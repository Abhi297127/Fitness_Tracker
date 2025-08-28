const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        age: req.user.age,
        height: req.user.height,
        weight: req.user.weight,
        goals: req.user.goals,
        joinDate: req.user.joinDate
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, age, height, weight, goals } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (age !== undefined) updateData.age = age;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (goals) updateData.goals = goals;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        height: updatedUser.height,
        weight: updatedUser.weight,
        goals: updatedUser.goals
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;