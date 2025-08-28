const express = require('express');
const Meal = require('../models/Meal');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add new meal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, mealType, items } = req.body;

    if (!mealType || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Meal type and at least one food item are required' 
      });
    }

    // Validate each food item
    for (const item of items) {
      if (!item.name || typeof item.calories !== 'number' || item.calories < 0) {
        return res.status(400).json({ 
          error: 'Each food item must have a name and valid calories' 
        });
      }
    }

    const meal = new Meal({
      userId: req.user._id,
      date: date ? new Date(date) : new Date(),
      mealType,
      items: items.map(item => ({
        name: item.name.trim(),
        calories: parseFloat(item.calories) || 0,
        protein: parseFloat(item.protein) || 0,
        carbs: parseFloat(item.carbs) || 0,
        fats: parseFloat(item.fats) || 0,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'serving'
      }))
    });

    await meal.save();

    res.status(201).json({
      message: 'Meal added successfully',
      meal: {
        id: meal._id,
        date: meal.date,
        mealType: meal.mealType,
        items: meal.items,
        totalCalories: meal.totalCalories,
        totalProtein: meal.totalProtein,
        totalCarbs: meal.totalCarbs,
        totalFats: meal.totalFats
      }
    });

  } catch (error) {
    console.error('Add meal error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to add meal' });
  }
});

// Get all meals for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, skip = 0, startDate, endDate, mealType } = req.query;

    const query = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Meal type filtering
    if (mealType) {
      query.mealType = mealType;
    }

    const meals = await Meal.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const totalCount = await Meal.countDocuments(query);

    res.json({
      meals: meals.map(meal => ({
        id: meal._id,
        date: meal.date,
        mealType: meal.mealType,
        items: meal.items,
        totalCalories: meal.totalCalories,
        totalProtein: meal.totalProtein,
        totalCarbs: meal.totalCarbs,
        totalFats: meal.totalFats,
        createdAt: meal.createdAt
      })),
      totalCount,
      hasMore: (parseInt(skip) + parseInt(limit)) < totalCount
    });

  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Get single meal
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-__v');

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({
      meal: {
        id: meal._id,
        date: meal.date,
        mealType: meal.mealType,
        items: meal.items,
        totalCalories: meal.totalCalories,
        totalProtein: meal.totalProtein,
        totalCarbs: meal.totalCarbs,
        totalFats: meal.totalFats,
        createdAt: meal.createdAt
      }
    });

  } catch (error) {
    console.error('Get meal error:', error);
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
});

// Update meal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { mealType, items } = req.body;

    if (!mealType || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Meal type and at least one food item are required' 
      });
    }

    // Validate each food item
    for (const item of items) {
      if (!item.name || typeof item.calories !== 'number' || item.calories < 0) {
        return res.status(400).json({ 
          error: 'Each food item must have a name and valid calories' 
        });
      }
    }

    const updateData = {
      mealType,
      items: items.map(item => ({
        name: item.name.trim(),
        calories: parseFloat(item.calories) || 0,
        protein: parseFloat(item.protein) || 0,
        carbs: parseFloat(item.carbs) || 0,
        fats: parseFloat(item.fats) || 0,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'serving'
      }))
    };

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({
      message: 'Meal updated successfully',
      meal: {
        id: meal._id,
        date: meal.date,
        mealType: meal.mealType,
        items: meal.items,
        totalCalories: meal.totalCalories,
        totalProtein: meal.totalProtein,
        totalCarbs: meal.totalCarbs,
        totalFats: meal.totalFats
      }
    });

  } catch (error) {
    console.error('Update meal error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update meal' });
  }
});

// Delete meal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

module.exports = router;