const express = require('express');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get progress summary (calories burned vs consumed)
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { period = 'week' } = req.query; // day, week, month
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }

    // Get workouts in date range
    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Get meals in date range
    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Create daily summaries
    const dailyData = {};
    
    // Initialize dates
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        caloriesBurned: 0,
        caloriesConsumed: 0,
        workoutCount: 0,
        mealCount: 0,
        netCalories: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add workout data
    workouts.forEach(workout => {
      const dateKey = workout.date.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].caloriesBurned += workout.calories;
        dailyData[dateKey].workoutCount += 1;
      }
    });

    // Add meal data
    meals.forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].caloriesConsumed += meal.totalCalories;
        dailyData[dateKey].mealCount += 1;
      }
    });

    // Calculate net calories
    Object.values(dailyData).forEach(day => {
      day.netCalories = day.caloriesConsumed - day.caloriesBurned;
    });

    // Calculate totals
    const totals = Object.values(dailyData).reduce((acc, day) => ({
      totalCaloriesBurned: acc.totalCaloriesBurned + day.caloriesBurned,
      totalCaloriesConsumed: acc.totalCaloriesConsumed + day.caloriesConsumed,
      totalWorkouts: acc.totalWorkouts + day.workoutCount,
      totalMeals: acc.totalMeals + day.mealCount
    }), {
      totalCaloriesBurned: 0,
      totalCaloriesConsumed: 0,
      totalWorkouts: 0,
      totalMeals: 0
    });

    totals.netCalories = totals.totalCaloriesConsumed - totals.totalCaloriesBurned;
    totals.averageCaloriesBurned = Math.round(totals.totalCaloriesBurned / Object.keys(dailyData).length);
    totals.averageCaloriesConsumed = Math.round(totals.totalCaloriesConsumed / Object.keys(dailyData).length);

    res.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dailyData: Object.values(dailyData),
      totals
    });

  } catch (error) {
    console.error('Get progress summary error:', error);
    res.status(500).json({ error: 'Failed to fetch progress summary' });
  }
});

// Get nutrition breakdown
router.get('/nutrition', authenticateToken, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const nutritionTotals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fats: acc.fats + meal.totalFats
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });

    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const averages = {
      calories: Math.round(nutritionTotals.calories / days),
      protein: Math.round(nutritionTotals.protein / days),
      carbs: Math.round(nutritionTotals.carbs / days),
      fats: Math.round(nutritionTotals.fats / days)
    };

    res.json({
      period,
      totals: nutritionTotals,
      averages,
      mealCount: meals.length
    });

  } catch (error) {
    console.error('Get nutrition breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
});

// Get workout analytics
router.get('/workouts', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Workout type distribution
    const typeDistribution = {};
    workouts.forEach(workout => {
      typeDistribution[workout.type] = (typeDistribution[workout.type] || 0) + 1;
    });

    // Weekly trends
    const weeklyData = {};
    workouts.forEach(workout => {
      const weekStart = new Date(workout.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          workouts: 0,
          totalCalories: 0,
          totalDuration: 0
        };
      }
      
      weeklyData[weekKey].workouts += 1;
      weeklyData[weekKey].totalCalories += workout.calories;
      weeklyData[weekKey].totalDuration += workout.duration;
    });

    const totals = workouts.reduce((acc, workout) => ({
      totalWorkouts: acc.totalWorkouts + 1,
      totalCalories: acc.totalCalories + workout.calories,
      totalDuration: acc.totalDuration + workout.duration
    }), {
      totalWorkouts: 0,
      totalCalories: 0,
      totalDuration: 0
    });

    res.json({
      period,
      totals,
      typeDistribution,
      weeklyTrends: Object.values(weeklyData).sort((a, b) => new Date(a.week) - new Date(b.week)),
      averageCaloriesPerWorkout: totals.totalWorkouts > 0 ? Math.round(totals.totalCalories / totals.totalWorkouts) : 0,
      averageDurationPerWorkout: totals.totalWorkouts > 0 ? Math.round(totals.totalDuration / totals.totalWorkouts) : 0
    });

  } catch (error) {
    console.error('Get workout analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch workout analytics' });
  }
});

module.exports = router;