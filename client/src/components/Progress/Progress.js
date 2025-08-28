import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState({
    summary: null,
    nutrition: null,
    workouts: null
  });

  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [summaryRes, nutritionRes, workoutsRes] = await Promise.all([
        axios.get(`/progress/summary?period=${period}`),
        axios.get(`/progress/nutrition?period=${period}`),
        axios.get(`/progress/workouts?period=${period}`)
      ]);

      setData({
        summary: summaryRes.data,
        nutrition: nutritionRes.data,
        workouts: workoutsRes.data
      });
    } catch (error) {
      console.error('Progress fetch error:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const getCaloriesChartData = () => {
    if (!data.summary?.dailyData) return null;

    return {
      labels: data.summary.dailyData.map(day => 
        new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Calories Consumed',
          data: data.summary.dailyData.map(day => day.caloriesConsumed),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Calories Burned',
          data: data.summary.dailyData.map(day => day.caloriesBurned),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  const getNutritionChartData = () => {
    if (!data.nutrition?.totals) return null;

    return {
      labels: ['Protein', 'Carbs', 'Fats'],
      datasets: [
        {
          data: [
            data.nutrition.totals.protein,
            data.nutrition.totals.carbs,
            data.nutrition.totals.fats,
          ],
          backgroundColor: [
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getWorkoutTypeData = () => {
    if (!data.workouts?.typeDistribution) return null;

    const types = Object.keys(data.workouts.typeDistribution);
    const values = Object.values(data.workouts.typeDistribution);

    return {
      labels: types.map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          data: values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="gradient-bg min-vh-100">
        <Container className="py-5">
          <div className="text-center text-white">
            <Spinner animation="border" />
            <p className="mt-3">Loading progress data...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-vh-100">
      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-white">
                <h1 className="display-6 fw-bold mb-0">Progress</h1>
                <p className="lead mb-0">Track your fitness journey</p>
              </div>
              <ButtonGroup>
                <Button
                  variant={period === 'week' ? 'light' : 'outline-light'}
                  onClick={() => setPeriod('week')}
                >
                  Week
                </Button>
                <Button
                  variant={period === 'month' ? 'light' : 'outline-light'}
                  onClick={() => setPeriod('month')}
                >
                  Month
                </Button>
              </ButtonGroup>
            </div>
          </Col>
        </Row>

        {/* Summary Stats */}
        {data.summary && (
          <Row className="mb-4 g-3">
            <Col lg={3} md={6}>
              <Card className="stat-card">
                <div className="stat-value">{data.summary.totals.totalWorkouts}</div>
                <div className="stat-label">Total Workouts</div>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="stat-card">
                <div className="stat-value">{Math.round(data.summary.totals.totalCaloriesBurned)}</div>
                <div className="stat-label">Calories Burned</div>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="stat-card">
                <div className="stat-value">{Math.round(data.summary.totals.totalCaloriesConsumed)}</div>
                <div className="stat-label">Calories Consumed</div>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="stat-card">
                <div className="stat-value text-success">
                  {data.summary.totals.netCalories > 0 ? '+' : ''}
                  {Math.round(data.summary.totals.netCalories)}
                </div>
                <div className="stat-label">Net Calories</div>
              </Card>
            </Col>
          </Row>
        )}

        <Row className="g-4">
          {/* Calories Chart */}
          <Col lg={8}>
            <Card className="dashboard-card">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Calories Trend</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  {getCaloriesChartData() ? (
                    <Line data={getCaloriesChartData()} options={chartOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <p className="text-muted">No data available</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Nutrition Breakdown */}
          <Col lg={4}>
            <Card className="dashboard-card">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Nutrition Breakdown</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  {getNutritionChartData() ? (
                    <Doughnut data={getNutritionChartData()} options={chartOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <p className="text-muted">No nutrition data</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Workout Types */}
          <Col lg={6}>
            <Card className="dashboard-card">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Workout Types Distribution</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  {getWorkoutTypeData() ? (
                    <Bar 
                      data={getWorkoutTypeData()} 
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                      }} 
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <p className="text-muted">No workout data</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Statistics Summary */}
          <Col lg={6}>
            <Card className="dashboard-card">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Summary Statistics</h5>
              </Card.Header>
              <Card.Body>
                {data.summary && data.workouts && (
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="h4 text-primary mb-1">
                          {data.summary.totals.averageCaloriesBurned}
                        </div>
                        <small className="text-muted">Avg Daily Calories Burned</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="h4 text-success mb-1">
                          {data.summary.totals.averageCaloriesConsumed}
                        </div>
                        <small className="text-muted">Avg Daily Calories Consumed</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="h4 text-warning mb-1">
                          {data.workouts.averageCaloriesPerWorkout}
                        </div>
                        <small className="text-muted">Avg Calories Per Workout</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="h4 text-info mb-1">
                          {data.workouts.averageDurationPerWorkout}
                        </div>
                        <small className="text-muted">Avg Minutes Per Workout</small>
                      </div>
                    </div>
                  </div>
                )}

                {data.nutrition && (
                  <div className="mt-4">
                    <h6>Nutrition Totals ({period})</h6>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="fw-bold text-warning">{Math.round(data.nutrition.totals.protein)}g</div>
                        <small className="text-muted">Protein</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-info">{Math.round(data.nutrition.totals.carbs)}g</div>
                        <small className="text-muted">Carbs</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-danger">{Math.round(data.nutrition.totals.fats)}g</div>
                        <small className="text-muted">Fats</small>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Progress;