import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DatasetsPage from './pages/DatasetsPage';
import PrivateRoute from './components/PrivateRoute';

// Компоненты
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import DatasetDetails from './pages/DatasetDetails';
import UsersPage from './pages/UsersPage';
import WorkshopsPage from './pages/WorkshopsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/datasets" 
          element={
            <PrivateRoute>
              <DatasetsPage />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App; 