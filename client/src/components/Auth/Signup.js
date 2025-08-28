import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    height: '',
    weight: '',
    goals: 'maintain'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      setError('Please enter a valid age between 13 and 120');
      setIsLoading(false);
      return;
    }

    try {
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        goals: formData.goals
      };

      const result = await signup(signupData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container gradient-bg">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="auth-card card-shadow">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="mb-2">Create Account</h2>
                  <p className="text-muted">Join FitTracker Pro today</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password *</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="At least 6 characters"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password *</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="Years"
                          min="13"
                          max="120"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Height (cm)</Form.Label>
                        <Form.Control
                          type="number"
                          name="height"
                          value={formData.height}
                          onChange={handleChange}
                          placeholder="cm"
                          min="50"
                          max="300"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Weight (kg)</Form.Label>
                        <Form.Control
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          placeholder="kg"
                          min="20"
                          max="500"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Fitness Goal</Form.Label>
                    <Form.Select
                      name="goals"
                      value={formData.goals}
                      onChange={handleChange}
                    >
                      <option value="lose_weight">Lose Weight</option>
                      <option value="gain_muscle">Gain Muscle</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="improve_endurance">Improve Endurance</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      className="btn-gradient"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="loading-spinner me-2"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary fw-semibold">
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="text-center mt-3">
                  <Link to="/" className="text-muted small">
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Home
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;