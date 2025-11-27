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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/expert/:id" element={<ExpertProfile />} />
              
              <Route path="/user-dashboard" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/expert-dashboard" element={
                <ProtectedRoute allowedRoles={['expert']}>
                  <ExpertDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/create-task" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <CreateTask />
                </ProtectedRoute>
              } />
              
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
              
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;