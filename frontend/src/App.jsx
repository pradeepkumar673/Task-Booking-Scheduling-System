import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import ExpertProfile from './pages/ExpertProfile';
import TaskHistory from './pages/TaskHistory';
import CreateTask from './pages/CreateTask';
import TaskChat from './pages/TaskChat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/expert/:id" element={<ExpertProfile />} />
              
              {/* Protected User Routes */}
              <Route path="/user-dashboard" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              {/* Protected Expert Routes */}
              <Route path="/expert-dashboard" element={
                <ProtectedRoute allowedRoles={['expert']}>
                  <ExpertDashboard />
                </ProtectedRoute>
              } />
              
              {/* Task Creation (Users only) */}
              <Route path="/create-task" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <CreateTask />
                </ProtectedRoute>
              } />
              
              {/* Shared Protected Routes */}
              <Route path="/task-history" element={
                <ProtectedRoute>
                  <TaskHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/chat/:taskId" element={
                <ProtectedRoute>
                  <TaskChat />
                </ProtectedRoute>
              } />
              
              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* 404 Fallback */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <a 
                      href="/login" 
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Go to Login
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;