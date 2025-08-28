import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cardio',
    duration: '',
    calories: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [exerciseSteps, setExerciseSteps] = useState([]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/workouts');
      setWorkouts(response.data.workouts);
    } catch (error) {
      console.error('Fetch workouts error:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingWorkout) {
        // Update existing workout
        const response = await axios.put(`/workouts/${editingWorkout.id}`, formData);
        toast.success('Workout updated successfully!');
        
        // Update the workout in the list
        setWorkouts(workouts.map(w => 
          w.id === editingWorkout.id ? response.data.workout : w
        ));
      } else {
        // Add new workout
        const response = await axios.post('/workouts', formData);
        toast.success('Workout added successfully!');
        
        // Add the new workout to the beginning of the list
        setWorkouts([response.data.workout, ...workouts]);
        
        // Set exercise steps if returned
        if (response.data.exerciseSteps) {
          setExerciseSteps(response.data.exerciseSteps);
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error('Submit workout error:', error);
      const message = error.response?.data?.error || 'Failed to save workout';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await axios.delete(`/workouts/${workoutId}`);
      toast.success('Workout deleted successfully!');
      setWorkouts(workouts.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Delete workout error:', error);
      toast.error('Failed to delete workout');
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      name: workout.name,
      type: workout.type,
      duration: workout.duration.toString(),
      calories: workout.calories.toString(),
      notes: workout.notes || '',
      date: new Date(workout.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWorkout(null);
    setFormData({
      name: '',
      type: 'cardio',
      duration: '',
      calories: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setExerciseSteps([]);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'cardio': return 'danger';
      case 'strength': return 'warning';
      case 'flexibility': return 'success';
      case 'sports': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="gradient-bg min-vh-100">
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-white">
                <h1 className="display-6 fw-bold mb-0">Workouts</h1>
                <p className="lead mb-0">Track your fitness activities</p>
              </div>
              <Button 
                className="btn-gradient"
                onClick={() => setShowModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Workout
              </Button>
            </div>
          </Col>
        </Row>

        {/* Exercise Steps Alert */}
        {exerciseSteps.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Alert variant="info" dismissible onClose={() => setExerciseSteps([])}>
                <Alert.Heading>Exercise Instructions</Alert.Heading>
                <ol className="mb-0">
                  {exerciseSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Workouts List */}
        <Row>
          <Col>
            {loading ? (
              <div className="text-center text-white py-5">
                <Spinner animation="border" />
                <p className="mt-3">Loading workouts...</p>
              </div>
            ) : workouts.length > 0 ? (
              <Row className="g-3">
                {workouts.map((workout) => (
                  <Col key={workout.id} lg={4} md={6}>
                    <Card className="workout-card h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="mb-0">{workout.name}</h5>
                          <Badge bg={getTypeColor(workout.type)}>
                            {workout.type}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">
                            {formatDate(workout.date)}
                          </small>
                        </div>

                        <div className="row text-center mb-3">
                          <div className="col-6">
                            <div className="fw-bold text-primary">{workout.duration}</div>
                            <small className="text-muted">Minutes</small>
                          </div>
                          <div className="col-6">
                            <div className="fw-bold text-danger">{workout.calories}</div>
                            <small className="text-muted">Calories</small>
                          </div>
                        </div>

                        {workout.notes && (
                          <p className="text-muted small mb-3">{workout.notes}</p>
                        )}

                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(workout)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(workout.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="text-center">
                <Card.Body className="py-5">
                  <i className="fas fa-dumbbell fa-3x text-muted mb-3"></i>
                  <h4>No Workouts Yet</h4>
                  <p className="text-muted mb-4">
                    Start tracking your fitness journey by adding your first workout!
                  </p>
                  <Button 
                    className="btn-gradient"
                    onClick={() => setShowModal(true)}
                  >
                    Add Your First Workout
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {/* Add/Edit Workout Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingWorkout ? 'Edit Workout' : 'Add New Workout'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Workout Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Morning Run, Chest Workout"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type *</Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="cardio">Cardio</option>
                      <option value="strength">Strength Training</option>
                      <option value="flexibility">Flexibility/Yoga</option>
                      <option value="sports">Sports</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration (minutes) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="30"
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Calories Burned *</Form.Label>
                    <Form.Control
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleChange}
                      placeholder="200"
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="How did it feel? Any achievements or observations?"
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-gradient" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="loading-spinner me-2"></span>
                      {editingWorkout ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingWorkout ? 'Update Workout' : 'Add Workout'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Workouts;