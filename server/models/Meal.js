const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true
  },
  calories: {
    type: Number,
    required: [true, 'Calories is required'],
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    default: 0,
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    default: 0,
    min: [0, 'Carbs cannot be negative']
  },
  fats: {
    type: Number,
    default: 0,
    min: [0, 'Fats cannot be negative']
  },
  quantity: {
    type: Number,
    default: 1,
    min: [0.1, 'Quantity must be positive']
  },
  unit: {
    type: String,
    default: 'serving',
    enum: ['serving', 'cup', 'tbsp', 'tsp', 'gram', 'oz', 'piece']
  }
});

const mealSchema = new mongoose.Schema({
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
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  items: [foodItemSchema],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFats: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
mealSchema.pre('save', function(next) {
  this.totalCalories = this.items.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
  this.totalProtein = this.items.reduce((sum, item) => sum + (item.protein * item.quantity), 0);
  this.totalCarbs = this.items.reduce((sum, item) => sum + (item.carbs * item.quantity), 0);
  this.totalFats = this.items.reduce((sum, item) => sum + (item.fats * item.quantity), 0);
  next();
});

module.exports = mongoose.model('Meal', mealSchema);