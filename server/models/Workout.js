const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  name: {
    type: String,
    required: [true, 'Workout name is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'other']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  calories: {
    type: Number,
    required: [true, 'Calories burned is required'],
    min: [1, 'Calories must be positive']
  },
  notes: {
    type: String,
    maxLength: [500, 'Notes must be less than 500 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema);