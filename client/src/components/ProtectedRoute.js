import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="gradient-bg" style={{ minHeight: '100vh' }}>
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="light" />
              <p className="text-white mt-3">Loading...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;