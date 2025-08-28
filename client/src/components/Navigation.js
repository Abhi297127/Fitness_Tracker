import React from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="fas fa-dumbbell me-2"></i>
          FitTracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  <i className="fas fa-tachometer-alt me-1"></i>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/workouts">
                  <i className="fas fa-running me-1"></i>
                  Workouts
                </Nav.Link>
                <Nav.Link as={Link} to="/meals">
                  <i className="fas fa-utensils me-1"></i>
                  Meals
                </Nav.Link>
                <Nav.Link as={Link} to="/progress">
                  <i className="fas fa-chart-line me-1"></i>
                  Progress
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-light"
                  id="dropdown-basic"
                  className="d-flex align-items-center"
                >
                  <i className="fas fa-user-circle me-2"></i>
                  {user.name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-light"
                  className="me-2"
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  variant="light"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;