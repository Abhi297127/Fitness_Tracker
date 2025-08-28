import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="gradient-bg">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="hero-title">
                Transform Your Fitness Journey
              </h1>
              <p className="hero-subtitle">
                Track workouts, monitor nutrition, and achieve your fitness goals with our comprehensive fitness tracker
              </p>
              {user ? (
                <Button
                  as={Link}
                  to="/dashboard"
                  size="lg"
                  className="btn-gradient me-3"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <div>
                  <Button
                    as={Link}
                    to="/signup"
                    size="lg"
                    className="btn-gradient me-3"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-light"
                    size="lg"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="text-white mb-4">Everything You Need to Stay Fit</h2>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <Card className="card-shadow h-100 text-center">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="fas fa-dumbbell fa-3x text-primary"></i>
                  </div>
                  <Card.Title>Workout Tracking</Card.Title>
                  <Card.Text>
                    Log your workouts with detailed exercise instructions and track calories burned. Monitor your fitness progress over time.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card-shadow h-100 text-center">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="fas fa-utensils fa-3x text-success"></i>
                  </div>
                  <Card.Title>Nutrition Monitoring</Card.Title>
                  <Card.Text>
                    Track your meals and nutrition intake. Monitor calories, proteins, carbs, and fats to maintain a balanced diet.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card-shadow h-100 text-center">
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <i className="fas fa-chart-line fa-3x text-info"></i>
                  </div>
                  <Card.Title>Progress Analytics</Card.Title>
                  <Card.Text>
                    Visualize your fitness journey with detailed charts and analytics. Track trends and celebrate milestones.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-5">
          <Container>
            <Row>
              <Col lg={8} className="mx-auto text-center">
                <Card className="card-shadow">
                  <Card.Body className="p-5">
                    <h3 className="mb-3">Ready to Start Your Fitness Journey?</h3>
                    <p className="text-muted mb-4">
                      Join thousands of users who have transformed their health with FitTracker Pro
                    </p>
                    <Button
                      as={Link}
                      to="/signup"
                      size="lg"
                      className="btn-gradient me-3"
                    >
                      Create Free Account
                    </Button>
                    <Button
                      as={Link}
                      to="/login"
                      variant="outline-primary"
                      size="lg"
                    >
                      Sign In
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

export default Home;