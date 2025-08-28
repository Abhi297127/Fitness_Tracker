# FitTracker Pro - React Frontend

A professional, modern React frontend for the FitTracker Pro fitness application built with Bootstrap and comprehensive fitness tracking features.

## 🚀 Features

- **Professional Dashboard** - Clean, modern interface with comprehensive fitness overview
- **User Authentication** - Secure login and registration with JWT
- **Workout Tracking** - Log workouts with exercise instructions and progress tracking
- **Meal Logging** - Track nutrition with detailed macronutrient breakdown
- **Progress Analytics** - Visual charts and statistics showing fitness progress
- **Profile Management** - User profile with BMI calculation and fitness goals
- **Responsive Design** - Mobile-first approach with Bootstrap components
- **Real-time Updates** - Toast notifications and instant data updates

## 🛠️ Technologies Used

- **React 18** - Modern React with hooks
- **Bootstrap 5** - Professional UI components
- **React Bootstrap** - Bootstrap components for React
- **Chart.js** - Beautiful, responsive charts
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications
- **Font Awesome** - Professional icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Running backend server (see backend documentation)

### Setup Steps

1. **Clone or create the project directory**
```bash
mkdir fitness-tracker-frontend
cd fitness-tracker-frontend
```

2. **Create package.json**
Copy the provided `package.json` file to your project root.

3. **Install dependencies**
```bash
npm install
```

4. **Create project structure**
```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   └── Signup.js
│   ├── Dashboard/
│   │   └── Dashboard.js
│   ├── Workouts/
│   │   └── Workouts.js
│   ├── Meals/
│   │   └── Meals.js
│   ├── Progress/
│   │   └── Progress.js
│   ├── Profile/
│   │   └── Profile.js
│   ├── Navigation.js
│   ├── Home.js
│   └── ProtectedRoute.js
├── context/
│   └── AuthContext.js
├── App.js
├── index.js
└── index.css
```

5. **Copy all component files**
Copy all the provided component files to their respective directories.

6. **Create public/index.html**
Copy the provided HTML file to your `public/` directory.

7. **Start the development server**
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🔧 Configuration

### Backend Connection
The frontend is configured to connect to the backend at `http://localhost:5000`. Update the axios baseURL in `src/context/AuthContext.js` if your backend runs on a different port:

```javascript
axios.defaults.baseURL = 'http://localhost:5000'; // Change this if needed
```

### Environment Variables
Create a `.env` file in the root directory if you need custom configurations:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_NAME=FitTracker Pro
```

## 🎨 Design Features

- **Modern Gradient Design** - Beautiful gradient backgrounds and modern UI
- **Professional Cards** - Clean card layouts with hover effects
- **Responsive Charts** - Interactive progress charts using Chart.js
- **Toast Notifications** - User-friendly success/error messages
- **Loading States** - Smooth loading indicators throughout the app
- **Form Validation** - Client-side validation with helpful error messages

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (< 768px)

## 🔐 Authentication Flow

1. **Home Page** - Landing page with login/signup options
2. **Registration** - User signup with profile information
3. **Login** - Secure authentication with JWT tokens
4. **Protected Routes** - Automatic redirection for unauthorized access
5. **Dashboard** - Main hub after successful login

## 📊 Key Components

### Dashboard
- Welcome message with user name
- Quick stats cards (streak, workouts, calories)
- Quick action buttons
- Recent workouts and meals
- Profile summary and daily motivation

### Workouts
- Add/edit workout modal with exercise types
- Exercise instructions for common activities
- Workout cards with duration and calories
- Filter and search capabilities

### Meals
- Comprehensive meal logging with multiple food items
- Macronutrient tracking (protein, carbs, fats)
- Meal type categorization
- Nutrition breakdown display

### Progress
- Interactive charts showing calories consumed vs burned
- Nutrition breakdown pie charts
- Workout type distribution
- Weekly/monthly progress views

### Profile
- User information management
- BMI calculation and categorization
- Fitness goal selection
- Profile picture placeholder

## 🚀 Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🔧 Customization

### Styling
- Main styles are in `src/index.css`
- Bootstrap theme can be customized by overriding CSS variables
- Color scheme uses CSS custom properties for easy theming

### Adding New Features
1. Create new components in appropriate folders
2. Add routes in `App.js`
3. Update navigation in `Navigation.js`
4. Add API calls in context or components

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured to allow frontend origin
   - Check backend is running on correct port

2. **Authentication Issues**
   - Clear browser cookies/localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **Chart Display Issues**
   - Ensure Chart.js is properly imported
   - Check data format matches chart requirements

4. **Bootstrap Styling Issues**
   - Ensure Bootstrap CSS is imported in index.js
   - Check for CSS conflicts

## 📝 API Integration

The frontend integrates with the following backend endpoints:

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/me` - Get current user
- `GET /workouts` - Fetch workouts
- `POST /workouts` - Add workout
- `GET /meals` - Fetch meals
- `POST /meals` - Add meal
- `GET /progress/summary` - Progress data
- `GET /extras/tips` - Fitness tips
- `GET /extras/streak` - Workout streak

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**FitTracker Pro** - Transform your fitness journey with professional tracking and analytics.