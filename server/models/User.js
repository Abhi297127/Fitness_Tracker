const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters']
  },
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be less than 120']
  },
  height: {
    type: Number,
    min: [50, 'Height must be realistic'],
    max: [300, 'Height must be realistic']
  },
  weight: {
    type: Number,
    min: [20, 'Weight must be realistic'],
    max: [500, 'Weight must be realistic']
  },
  goals: {
    type: String,
    enum: ['lose_weight', 'gain_muscle', 'maintain', 'improve_endurance'],
    default: 'maintain'
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);