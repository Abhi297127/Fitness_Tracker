import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    date: new Date().toISOString().split('T')[0],
    items: [{ name: '', calories: '', protein: '', carbs: '', fats: '', quantity: '1', unit: 'serving' }]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/meals');
      setMeals(response.data.meals);
    } catch (error) {
      console.error('Fetch meals error:', error);
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Improved validation - Filter out empty items with better validation
    const validItems = formData.items.filter(item => {
      const name = item.name?.toString().trim();
      const calories = item.calories?.toString().trim();
      
      // Check if name exists and calories is a valid positive number
      return name && 
             calories && 
             !isNaN(calories) && 
             parseFloat(calories) > 0;
    });

    if (validItems.length === 0) {
      toast.error('Please add at least one food item with valid name and calories');
      setSubmitting(false);
      return;
    }

    try {
      // Clean and format the data before sending
      const cleanedItems = validItems.map(item => ({
        name: item.name.toString().trim(),
        calories: parseFloat(item.calories) || 0,
        protein: parseFloat(item.protein) || 0,
        carbs: parseFloat(item.carbs) || 0,
        fats: parseFloat(item.fats) || 0,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'serving'
      }));

      const mealData = {
        ...formData,
        items: cleanedItems
      };

      console.log('Sending meal data:', mealData); // Debug log

      if (editingMeal) {
        const response = await axios.put(`/meals/${editingMeal.id}`, mealData);
        toast.success('Meal updated successfully!');
        setMeals(meals.map(m => 
          m.id === editingMeal.id ? response.data.meal : m
        ));
      } else {
        const response = await axios.post('/meals', mealData);
        toast.success('Meal added successfully!');
        setMeals([response.data.meal, ...meals]);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Submit meal error:', error);
      console.error('Error response:', error.response?.data); // Debug log
      const message = error.response?.data?.error || 'Failed to save meal';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      await axios.delete(`/meals/${mealId}`);
      toast.success('Meal deleted successfully!');
      setMeals(meals.filter(m => m.id !== mealId));
    } catch (error) {
      console.error('Delete meal error:', error);
      toast.error('Failed to delete meal');
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      mealType: meal.mealType,
      date: new Date(meal.date).toISOString().split('T')[0],
      items: meal.items.map(item => ({
        name: item.name,
        calories: item.calories.toString(),
        protein: item.protein.toString(),
        carbs: item.carbs.toString(),
        fats: item.fats.toString(),
        quantity: item.quantity.toString(),
        unit: item.unit
      }))
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMeal(null);
    setFormData({
      mealType: 'breakfast',
      date: new Date().toISOString().split('T')[0],
      items: [{ name: '', calories: '', protein: '', carbs: '', fats: '', quantity: '1', unit: 'serving' }]
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const addFoodItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', calories: '', protein: '', carbs: '', fats: '', quantity: '1', unit: 'serving' }]
    });
  };

  const removeFoodItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: newItems
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'breakfast': return 'warning';
      case 'lunch': return 'success';
      case 'dinner': return 'danger';
      case 'snack': return 'info';
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
                <h1 className="display-6 fw-bold mb-0">Meals</h1>
                <p className="lead mb-0">Track your nutrition intake</p>
              </div>
              <Button 
                className="btn-gradient"
                onClick={() => setShowModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Meal
              </Button>
            </div>
          </Col>
        </Row>

        {/* Meals List */}
        <Row>
          <Col>
            {loading ? (
              <div className="text-center text-white py-5">
                <Spinner animation="border" />
                <p className="mt-3">Loading meals...</p>
              </div>
            ) : meals.length > 0 ? (
              <Row className="g-3">
                {meals.map((meal) => (
                  <Col key={meal.id} lg={6} xl={4}>
                    <Card className="meal-card h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="mb-0 text-capitalize">{meal.mealType}</h5>
                          <Badge bg={getMealTypeColor(meal.mealType)}>
                            {meal.items.length} items
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">
                            {formatDate(meal.date)}
                          </small>
                        </div>

                        <div className="row text-center mb-3">
                          <div className="col-6">
                            <div className="fw-bold text-primary">{Math.round(meal.totalCalories)}</div>
                            <small className="text-muted">Calories</small>
                          </div>
                          <div className="col-6">
                            <div className="fw-bold text-success">{Math.round(meal.totalProtein)}g</div>
                            <small className="text-muted">Protein</small>
                          </div>
                        </div>

                        <div className="row text-center mb-3">
                          <div className="col-6">
                            <div className="fw-bold text-warning">{Math.round(meal.totalCarbs)}g</div>
                            <small className="text-muted">Carbs</small>
                          </div>
                          <div className="col-6">
                            <div className="fw-bold text-danger">{Math.round(meal.totalFats)}g</div>
                            <small className="text-muted">Fats</small>
                          </div>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted d-block">Food Items:</small>
                          {meal.items.map((item, index) => (
                            <small key={index} className="d-block">
                              • {item.name} ({item.quantity} {item.unit})
                            </small>
                          ))}
                        </div>

                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(meal)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(meal.id)}
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
                  <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                  <h4>No Meals Yet</h4>
                  <p className="text-muted mb-4">
                    Start tracking your nutrition by logging your first meal!
                  </p>
                  <Button 
                    className="btn-gradient"
                    onClick={() => setShowModal(true)}
                  >
                    Add Your First Meal
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {/* Add/Edit Meal Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingMeal ? 'Edit Meal' : 'Add New Meal'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Meal Type *</Form.Label>
                    <Form.Select
                      name="mealType"
                      value={formData.mealType}
                      onChange={handleChange}
                      required
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
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

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Food Items</h6>
                  <Button 
                    type="button" 
                    variant="outline-primary" 
                    size="sm"
                    onClick={addFoodItem}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Add Item
                  </Button>
                </div>

                {formData.items.map((item, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Food Name *</Form.Label>
                            <Form.Control
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              placeholder="e.g., Chicken Breast"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group className="mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              step="0.1"
                              min="0.1"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group className="mb-3">
                            <Form.Label>Unit</Form.Label>
                            <Form.Select
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            >
                              <option value="serving">serving</option>
                              <option value="cup">cup</option>
                              <option value="tbsp">tbsp</option>
                              <option value="tsp">tsp</option>
                              <option value="gram">gram</option>
                              <option value="oz">oz</option>
                              <option value="piece">piece</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Calories *</Form.Label>
                            <Form.Control
                              type="number"
                              value={item.calories}
                              onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                              placeholder="200"
                              min="0"
                              step="0.1"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={1} className="d-flex align-items-end">
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              className="mb-3"
                              onClick={() => removeFoodItem(index)}
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Protein (g)</Form.Label>
                            <Form.Control
                              type="number"
                              value={item.protein}
                              onChange={(e) => handleItemChange(index, 'protein', e.target.value)}
                              placeholder="20"
                              min="0"
                              step="0.1"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Carbs (g)</Form.Label>
                            <Form.Control
                              type="number"
                              value={item.carbs}
                              onChange={(e) => handleItemChange(index, 'carbs', e.target.value)}
                              placeholder="30"
                              min="0"
                              step="0.1"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Fats (g)</Form.Label>
                            <Form.Control
                              type="number"
                              value={item.fats}
                              onChange={(e) => handleItemChange(index, 'fats', e.target.value)}
                              placeholder="10"
                              min="0"
                              step="0.1"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-gradient" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="loading-spinner me-2"></span>
                      {editingMeal ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingMeal ? 'Update Meal' : 'Add Meal'
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

export default Meals;