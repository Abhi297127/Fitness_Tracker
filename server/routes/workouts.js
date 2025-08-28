const express = require('express');
const Workout = require('../models/Workout');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Exercise instructions database
const exerciseInstructions = {
  'cardio': {
    'running': [
      'Start with a 5-minute warm-up walk',
      'Begin jogging at a comfortable pace',
      'Maintain steady breathing rhythm',
      'Keep your posture upright',
      'Land on the balls of your feet',
      'Cool down with a 5-minute walk',
      'Stretch your calves and hamstrings'
    ],
    'cycling': [
      'Adjust bike seat to hip height',
      'Start with easy pedaling for 5 minutes',
      'Maintain 80-100 RPM cadence',
      'Keep your core engaged',
      'Alternate between sitting and standing',
      'Cool down with easy pedaling',
      'Stretch your quads and hip flexors'
    ],
    'swimming': [
      'Start with 5 minutes of easy swimming',
      'Focus on proper breathing technique',
      'Keep your body horizontal in water',
      'Use long, smooth strokes',
      'Alternate between different strokes',
      'Cool down with easy backstroke',
      'Stretch shoulders and back'
    ]
  },
  'strength': {
    'push-ups': [
      'Start in plank position',
      'Place hands slightly wider than shoulders',
      'Keep your body in straight line',
      'Lower chest to ground',
      'Push back up to starting position',
      'Keep core tight throughout',
      'Breathe in down, breathe out up'
    ],
    'squats': [
      'Stand with feet shoulder-width apart',
      'Keep your chest up and core tight',
      'Lower by pushing hips back',
      'Go down until thighs are parallel',
      'Push through heels to stand up',
      'Keep knees aligned with toes',
      'Squeeze glutes at the top'
    ],
    'deadlifts': [
      'Stand with feet hip-width apart',
      'Grip bar with hands outside legs',
      'Keep back straight and chest up',
      'Lift by extending hips and knees',
      'Keep bar close to your body',
      'Stand tall at the top',
      'Lower with control'
    ]
  },
  'flexibility': {
    'yoga': [
      'Start with deep breathing exercises',
      'Begin with gentle warm-up poses',
      'Hold each pose for 5-8 breaths',
      'Focus on proper alignment',
      'Listen to your body',
      'Transition slowly between poses',
      'End with relaxation pose'
    ],
    'stretching': [
      'Warm up with light movement',
      'Hold each stretch for 30 seconds',
      'Breathe deeply and relax',
      'Never force a stretch',
      'Feel gentle tension, not pain',
      'Stretch both sides equally',
      'Cool down gradually'
    ]
  },
  'sports': {
    'basketball': [
      'Warm up with light dribbling',
      'Practice shooting form',
      'Focus on footwork',
      'Play at game intensity',
      'Stay hydrated throughout',
      'Cool down with free throws',
      'Stretch arms and legs'
    ],
    'tennis': [
      'Start with gentle rallying',
      'Work on different strokes',
      'Focus on footwork and positioning',
      'Practice serving technique',
      'Play points or games',
      'Cool down with easy hitting',
      'Stretch shoulders and wrists'
    ]
  }
};

// Get exercise instructions
const getExerciseSteps = (type, name) => {
  const normalizedType = type.toLowerCase();
  const normalizedName = name.toLowerCase();
  
  if (exerciseInstructions[normalizedType]) {
    for (const [exerciseName, steps] of Object.entries(exerciseInstructions[normalizedType])) {
      if (normalizedName.includes(exerciseName) || exerciseName.includes(normalizedName)) {
        return steps;
      }
    }
  }
  
  // Default generic steps
  return [
    'Start with a proper warm-up',
    'Focus on correct form and technique',
    'Maintain steady breathing throughout',
    'Listen to your body and adjust intensity',
    'Stay hydrated during the workout',
    'Cool down with light activity',
    'Finish with appropriate stretching'
  ];
};

// Add new workout
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, name, type, duration, calories, notes } = req.body;

    if (!name || !type || !duration || !calories) {
      return res.status(400).json({ 
        error: 'Name, type, duration, and calories are required' 
      });
    }

    const workout = new Workout({
      userId: req.user._id,
      date: date ? new Date(date) : new Date(),
      name: name.trim(),
      type,
      duration: parseInt(duration),
      calories: parseInt(calories),
      notes: notes?.trim()
    });

    await workout.save();

    // Get exercise instructions
    const steps = getExerciseSteps(type, name);

    res.status(201).json({
      message: 'Workout added successfully',
      workout: {
        id: workout._id,
        date: workout.date,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        calories: workout.calories,
        notes: workout.notes
      },
      exerciseSteps: steps
    });

  } catch (error) {
    console.error('Add workout error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to add workout' });
  }
});

// Get all workouts for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, skip = 0, startDate, endDate, type } = req.query;

    const query = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Type filtering
    if (type) {
      query.type = type;
    }

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const totalCount = await Workout.countDocuments(query);

    res.json({
      workouts: workouts.map(workout => ({
        id: workout._id,
        date: workout.date,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        calories: workout.calories,
        notes: workout.notes,
        createdAt: workout.createdAt
      })),
      totalCount,
      hasMore: (parseInt(skip) + parseInt(limit)) < totalCount
    });

  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Get single workout
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-__v');

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Get exercise instructions
    const steps = getExerciseSteps(workout.type, workout.name);

    res.json({
      workout: {
        id: workout._id,
        date: workout.date,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        calories: workout.calories,
        notes: workout.notes,
        createdAt: workout.createdAt
      },
      exerciseSteps: steps
    });

  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

// Update workout
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, duration, calories, notes } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (type) updateData.type = type;
    if (duration) updateData.duration = parseInt(duration);
    if (calories) updateData.calories = parseInt(calories);
    if (notes !== undefined) updateData.notes = notes?.trim();

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({
      message: 'Workout updated successfully',
      workout: {
        id: workout._id,
        date: workout.date,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        calories: workout.calories,
        notes: workout.notes
      }
    });

  } catch (error) {
    console.error('Update workout error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update workout' });
  }
});

// Delete workout
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

module.exports = router;