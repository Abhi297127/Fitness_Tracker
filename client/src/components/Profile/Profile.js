import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    height: user?.height || '',
    weight: user?.weight || '',
    goals: user?.goals || 'maintain'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      setError('Please enter a valid age between 13 and 120');
      setLoading(false);
      return;
    }

    if (formData.height && (formData.height < 50 || formData.height > 300)) {
      setError('Please enter a valid height between 50-300 cm');
      setLoading(false);
      return;
    }

    if (formData.weight && (formData.weight < 20 || formData.weight > 500)) {
      setError('Please enter a valid weight between 20-500 kg');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        goals: formData.goals
      };

      const result = await updateProfile(updateData);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      age: user?.age || '',
      height: user?.height || '',
      weight: user?.weight || '',
      goals: user?.goals || 'maintain'
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
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

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateBMI = () => {
    if (user?.height && user?.weight) {
      const heightInMeters = user.height / 100;
      const bmi = user.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'info' };
    if (bmi < 25) return { category: 'Normal weight', color: 'success' };
    if (bmi < 30) return { category: 'Overweight', color: 'warning' };
    return { category: 'Obese', color: 'danger' };
  };

  return (
    <div className="gradient-bg min-vh-100">
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="text-white text-center">
              <h1 className="display-6 fw-bold mb-0">Profile</h1>
              <p className="lead mb-0">Manage your account information</p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="dashboard-card">
              <Card.Body className="p-4">
                {/* Profile Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="fas fa-user-circle fa-5x text-primary"></i>
                  </div>
                  <h3>{user?.name}</h3>
                  <p className="text-muted">{user?.email}</p>
                  {user?.joinDate && (
                    <small className="text-muted">
                      Member since {formatJoinDate(user.joinDate)}
                    </small>
                  )}
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4">
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <Form.Control
                            type="text"
                            value={user?.name || 'Not provided'}
                            readOnly
                            className="bg-light"
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          Email cannot be changed
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Age</Form.Label>
                        {isEditing ? (
                          <Form.Control
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Enter your age"
                            min="13"
                            max="120"
                          />
                        ) : (
                          <Form.Control
                            type="text"
                            value={user?.age ? `${user.age} years` : 'Not provided'}
                            readOnly
                            className="bg-light"
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Height (cm)</Form.Label>
                        {isEditing ? (
                          <Form.Control
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="Enter height in cm"
                            min="50"
                            max="300"
                          />
                        ) : (
                          <Form.Control
                            type="text"
                            value={user?.height ? `${user.height} cm` : 'Not provided'}
                            readOnly
                            className="bg-light"
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Weight (kg)</Form.Label>
                        {isEditing ? (
                          <Form.Control
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="Enter weight in kg"
                            min="20"
                            max="500"
                          />
                        ) : (
                          <Form.Control
                            type="text"
                            value={user?.weight ? `${user.weight} kg` : 'Not provided'}
                            readOnly
                            className="bg-light"
                          />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Form.Group className="mb-4">
                        <Form.Label>Fitness Goal</Form.Label>
                        {isEditing ? (
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
                        ) : (
                          <Form.Control
                            type="text"
                            value={formatGoal(user?.goals)}
                            readOnly
                            className="bg-light"
                          />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* BMI Display */}
                  {calculateBMI() && (
                    <Row>
                      <Col>
                        <Alert variant="info" className="mb-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Your BMI: {calculateBMI()}</strong>
                              <span className={`ms-2 badge bg-${getBMICategory(calculateBMI()).color}`}>
                                {getBMICategory(calculateBMI()).category}
                              </span>
                            </div>
                            <small className="text-muted">
                              Body Mass Index
                            </small>
                          </div>
                        </Alert>
                      </Col>
                    </Row>
                  )}

                  <div className="d-flex justify-content-center gap-3">
                    {isEditing ? (
                      <>
                        <Button variant="secondary" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="btn-gradient"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="loading-spinner me-2"></span>
                              Updating...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="btn-gradient"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="fas fa-edit me-2"></i>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;