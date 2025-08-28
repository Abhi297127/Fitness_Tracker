const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Workout.deleteMany({}),
      Meal.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        age: 28,
        height: 180,
        weight: 75,
        goals: 'gain_muscle'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: hashedPassword,
        age: 25,
        height: 165,
        weight: 60,
        goals: 'lose_weight'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        passwordHash: hashedPassword,
        age: 32,
        height: 175,
        weight: 80,
        goals: 'improve_endurance'
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create sample workouts
    const workouts = [];
    const workoutTypes = ['cardio', 'strength', 'flexibility', 'sports'];
    const workoutNames = {
      cardio: ['Morning Run', 'Evening Jog', 'Cycling', 'Swimming'],
      strength: ['Push Day', 'Pull Day', 'Leg Day', 'Full Body'],
      flexibility: ['Yoga Session', 'Stretching', 'Pilates'],
      sports: ['Basketball', 'Tennis', 'Soccer', 'Volleyball']
    };

    for (const user of users) {
      for (let i = 0; i < 10; i++) {
        const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
        const names = workoutNames[type];
        const name = names[Math.floor(Math.random() * names.length)];
        
        const date = new Date();
        date.setDate(date.getDate() - i);

        workouts.push({
          userId: user._id,
          date: date,
          name: name,
          type: type,
          duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          calories: Math.floor(Math.random() * 400) + 200, // 200-600 calories
          notes: i % 3 === 0 ? `Great ${type} session!` : undefined
        });
      }
    }

    await Workout.create(workouts);
    console.log(`✅ Created ${workouts.length} workouts`);

    // Create sample meals
    const meals = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const foodItems = {
      breakfast: [
        { name: 'Oatmeal', calories: 150, protein: 5, carbs: 30, fats: 3 },
        { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 6, fats: 0 },
        { name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0 },
        { name: 'Eggs', calories: 70, protein: 6, carbs: 1, fats: 5 }
      ],
      lunch: [
        { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 4 },
        { name: 'Brown Rice', calories: 110, protein: 3, carbs: 22, fats: 1 },
        { name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fats: 0 },
        { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15 }
      ],
      dinner: [
        { name: 'Salmon', calories: 206, protein: 28, carbs: 0, fats: 12 },
        { name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fats: 0 },
        { name: 'Asparagus', calories: 20, protein: 2, carbs: 4, fats: 0 },
        { name: 'Quinoa', calories: 120, protein: 4, carbs: 22, fats: 2 }
      ],
      snack: [
        { name: 'Apple', calories: 80, protein: 0, carbs: 22, fats: 0 },
        { name: 'Almonds', calories: 160, protein: 6, carbs: 6, fats: 14 },
        { name: 'Protein Bar', calories: 200, protein: 20, carbs: 20, fats: 8 }
      ]
    };

    for (const user of users) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        for (const mealType of mealTypes) {
          if (Math.random() > 0.2) { // 80% chance of having each meal
            const availableItems = foodItems[mealType];
            const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
            const selectedItems = [];

            for (let j = 0; j < numItems; j++) {
              const item = availableItems[Math.floor(Math.random() * availableItems.length)];
              selectedItems.push({
                ...item,
                quantity: Math.random() > 0.5 ? 1 : 1.5
              });
            }

            meals.push({
              userId: user._id,
              date: date,
              mealType: mealType,
              items: selectedItems
            });
          }
        }
      }
    }

    await Meal.create(meals);
    console.log(`✅ Created ${meals.length} meals`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample login credentials:');
    console.log('Email: john@example.com');
    console.log('Email: jane@example.com');
    console.log('Email: mike@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit();
  }
};

seedData();