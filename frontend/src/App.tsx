import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Practices from './pages/Practices';
import PracticeDetail from './pages/PracticeDetail';
import MyParticipations from './pages/MyParticipations';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminBallBags from './pages/AdminBallBags';
import AdminSettings from './pages/AdminSettings';
import AdminPractices from './pages/AdminPractices';
import PaymentManagement from './pages/PaymentManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/practices"
            element={
              <PrivateRoute>
                <Layout>
                  <Practices />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/practices/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <PracticeDetail />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-participations"
            element={
              <PrivateRoute>
                <Layout>
                  <MyParticipations />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <Layout>
                  <Stats />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Layout>
                  <Admin />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminUsers />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/ball-bags"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminBallBags />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminSettings />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/practices"
            element={
              <PrivateRoute>
                <Layout>
                  <AdminPractices />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <PrivateRoute>
                <Layout>
                  <PaymentManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
