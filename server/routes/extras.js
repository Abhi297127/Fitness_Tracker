const express = require('express');
const Workout = require('../models/Workout');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Motivational fitness tips
const fitnessTips = [
  "Start your day with a 10-minute walk to boost energy and mood!",
  "Stay hydrated - drink water before, during, and after workouts.",
  "Progress is progress, no matter how small. Celebrate every victory!",
  "Mix up your workouts to keep things interesting and challenge different muscles.",
  "Listen to your body - rest days are just as important as workout days.",
  "Set realistic goals and track your progress to stay motivated.",
  "Find a workout buddy or join a fitness community for accountability.",
  "Focus on how exercise makes you feel, not just how you look.",
  "Consistency beats perfection - aim for progress, not perfection.",
  "Remember: every expert was once a beginner. Keep going!",
  "Strength doesn't come from what you can do, it comes from overcoming things you thought you couldn't.",
  "Your body can do it. It's your mind you need to convince.",
  "The only bad workout is the one that didn't happen.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "Success is the sum of small efforts repeated day in and day out."
];

// Get motivational fitness tips
router.get('/tips', authenticateToken, async (req, res) => {
  try {
    // Return 5 random tips
    const shuffled = [...fitnessTips].sort(() => 0.5 - Math.random());
    const selectedTips = shuffled.slice(0, 5);

    res.json({
      tips: selectedTips,
      totalTips: fitnessTips.length
    });
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ error: 'Failed to fetch tips' });
  }
});

// Calculate workout streak
router.get('/streak', authenticateToken, async (req, res) => {
  try {
    // Get all workouts for user, sorted by date descending
    const workouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 })
      .select('date');

    if (workouts.length === 0) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
        message: "Start your fitness journey today!"
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Group workouts by date
    const workoutDates = new Set();
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      workoutDates.add(workoutDate.toISOString());
    });

    const sortedDates = Array.from(workoutDates)
      .map(date => new Date(date))
      .sort((a, b) => b - a);

    // Calculate current streak
    let checkDate = new Date(today);
    for (const workoutDate of sortedDates) {
      const daysDiff = Math.floor((checkDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        currentStreak++;
        checkDate = new Date(workoutDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    const allDates = sortedDates.reverse(); // oldest first
    
    for (let i = 0; i < allDates.length; i++) {
      tempStreak = 1;
      
      for (let j = i + 1; j < allDates.length; j++) {
        const daysDiff = Math.floor((allDates[j] - allDates[j-1]) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          tempStreak++;
        } else {
          break;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const lastWorkoutDate = workouts[0].date;
    const daysSinceLastWorkout = Math.floor((today - new Date(lastWorkoutDate)) / (1000 * 60 * 60 * 24));

    let message = '';
    if (currentStreak === 0) {
      if (daysSinceLastWorkout === 0) {
        message = "Great job working out today! Keep the momentum going!";
      } else if (daysSinceLastWorkout === 1) {
        message = "You worked out yesterday! Start a new streak today!";
      } else {
        message = `It's been ${daysSinceLastWorkout} days since your last workout. Time to get back on track!`;
      }
    } else if (currentStreak === 1) {
      message = "You're on a 1-day streak! Keep it up!";
    } else {
      message = `Amazing! You're on a ${currentStreak}-day streak!`;
    }

    res.json({
      currentStreak,
      longestStreak,
      lastWorkoutDate,
      daysSinceLastWorkout,
      totalWorkouts: workouts.length,
      message
    });

  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to calculate workout streak' });
  }
});

// Get workout stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo }
    });

    const stats = {
      totalWorkouts: workouts.length,
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + w.calories, 0),
      totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
      averageCaloriesPerWorkout: workouts.length > 0 ? 
        Math.round(workouts.reduce((sum, w) => sum + w.calories, 0) / workouts.length) : 0,
      averageDurationPerWorkout: workouts.length > 0 ? 
        Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) : 0,
      workoutTypes: {}
    };

    // Count workout types
    workouts.forEach(workout => {
      stats.workoutTypes[workout.type] = (stats.workoutTypes[workout.type] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch workout stats' });
  }
});

module.exports = router;