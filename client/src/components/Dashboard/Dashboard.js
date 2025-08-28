import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    streak: null,
    stats: null,
    tips: [],
    recentWorkouts: [],
    recentMeals: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [summaryRes, streakRes, statsRes, tipsRes, workoutsRes, mealsRes] = await Promise.all([
        axios.get('/progress/summary?period=week'),
        axios.get('/extras/streak'),
        axios.get('/extras/stats'),
        axios.get('/extras/tips'),
        axios.get('/workouts?limit=5'),
        axios.get('/meals?limit=5')
      ]);

      setData({
        summary: summaryRes.data,
        streak: streakRes.data,
        stats: statsRes.data,
        tips: tipsRes.data.tips,
        recentWorkouts: workoutsRes.data.workouts,
        recentMeals: mealsRes.data.meals
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatGoal = (goal) => {
    const goalMap = {
      lose_weight: 'Lose Weight',
      gain_muscle: 'Gain Muscle',
      maintain: 'Maintain Weight',
      improve_endurance: 'Improve Endurance'
    };
    return goalMap[goal] || goal;
  };

  if (loading) {
    return (
      <div className="gradient-bg min-vh-100">
        <Container className="py-5">
          <div className="text-center text-white">
            <Spinner animation="border" />
            <p className="mt-3">Loading your dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-vh-100">
      <Container className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="text-white text-center">
              <h1 className="display-5 fw-bold">Welcome back, {user.name}!</h1>
              <p className="lead">Here's your fitness overview</p>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          <Col lg={3} md={6}>
            <Card className="stat-card">
              <div className="stat-value">{data.streak?.currentStreak || 0}</div>
              <div className="stat-label">Day Streak</div>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="stat-card">
              <div className="stat-value">{data.summary?.totals.totalWorkouts || 0}</div>
              <div className="stat-label">This Week</div>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="stat-card">
              <div className="stat-value">{data.summary?.totals.totalCaloriesBurned || 0}</div>
              <div className="stat-label">Calories Burned</div>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="stat-card">
              <div className="stat-value">{data.summary?.totals.totalMeals || 0}</div>
              <div className="stat-label">Meals Logged</div>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Quick Actions */}
          <Col lg={4}>
            <Card className="dashboard-card h-100">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button 
                    as={Link} 
                    to="/workouts" 
                    variant="primary"
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Log Workout
                  </Button>
                  <Button 
                    as={Link} 
                    to="/meals" 
                    variant="success"
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Log Meal
                  </Button>
                  <Button 
                    as={Link} 
                    to="/progress" 
                    variant="info"
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    View Progress
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Profile Summary */}
          <Col lg={4}>
            <Card className="dashboard-card h-100">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Profile Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Goal:</strong> {formatGoal(user.goals)}
                </div>
                {user.age && (
                  <div className="mb-3">
                    <strong>Age:</strong> {user.age} years
                  </div>
                )}
                {user.height && (
                  <div className="mb-3">
                    <strong>Height:</strong> {user.height} cm
                  </div>
                )}
                {user.weight && (
                  <div className="mb-3">
                    <strong>Weight:</strong> {user.weight} kg
                  </div>
                )}
                <Button 
                  as={Link} 
                  to="/profile" 
                  variant="outline-primary" 
                  size="sm"
                >
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Motivation */}
          <Col lg={4}>
            <Card className="dashboard-card h-100">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Daily Motivation</h5>
              </Card.Header>
              <Card.Body>
                {data.streak && (
                  <Alert variant="info" className="mb-3">
                    <strong>{data.streak.message}</strong>
                  </Alert>
                )}
                {data.tips.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-0 small text-muted">Tip of the day:</p>
                    <p className="mb-0">{data.tips[0]}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4 g-4">
          {/* Recent Workouts */}
          <Col lg={6}>
            <Card className="dashboard-card">
              <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Workouts</h5>
                <Button 
                  as={Link} 
                  to="/workouts" 
                  variant="link" 
                  size="sm"
                  className="text-decoration-none"
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {data.recentWorkouts.length > 0 ? (
                  <div>
                    {data.recentWorkouts.map((workout) => (
                      <div 
                        key={workout.id}
                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                      >
                        <div>
                          <div className="fw-semibold">{workout.name}</div>
                          <small className="text-muted">
                            {formatDate(workout.date)} • {workout.duration} min • {workout.calories} cal
                          </small>
                        </div>
                        <span className={`badge bg-${
                          workout.type === 'cardio' ? 'danger' :
                          workout.type === 'strength' ? 'warning' :
                          workout.type === 'flexibility' ? 'success' :
                          'secondary'
                        }`}>
                          {workout.type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">
                    No workouts logged yet. 
                    <Link to="/workouts" className="d-block mt-2">
                      Start your first workout!
                    </Link>
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Meals */}
          <Col lg={6}>
            <Card className="dashboard-card">
              <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Meals</h5>
                <Button 
                  as={Link} 
                  to="/meals" 
                  variant="link" 
                  size="sm"
                  className="text-decoration-none"
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body>
                {data.recentMeals.length > 0 ? (
                  <div>
                    {data.recentMeals.map((meal) => (
                      <div 
                        key={meal.id}
                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                      >
                        <div>
                          <div className="fw-semibold text-capitalize">{meal.mealType}</div>
                          <small className="text-muted">
                            {formatDate(meal.date)} • {meal.totalCalories} calories
                          </small>
                        </div>
                        <span className={`badge bg-${
                          meal.mealType === 'breakfast' ? 'warning' :
                          meal.mealType === 'lunch' ? 'success' :
                          meal.mealType === 'dinner' ? 'danger' :
                          'secondary'
                        }`}>
                          {meal.items.length} items
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">
                    No meals logged yet. 
                    <Link to="/meals" className="d-block mt-2">
                      Log your first meal!
                    </Link>
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;