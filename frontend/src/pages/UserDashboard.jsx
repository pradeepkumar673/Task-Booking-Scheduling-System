import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [availableExperts, setAvailableExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket, onlineExperts } = useSocket();

  useEffect(() => {
    fetchTasks();
    fetchAvailableExperts();
  }, []);

  useEffect(() => {
    setAvailableExperts(onlineExperts);
  }, [onlineExperts]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/my-tasks');
      setTasks(response.data.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExperts = async () => {
    try {
      const response = await axios.get('/api/experts/available');
      setAvailableExperts(response.data.data.experts);
    } catch (error) {
      console.error('Error fetching experts:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Experts</p>
                <p className="text-2xl font-bold text-gray-900">{availableExperts.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <Link to="/create-task" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Create New Task</p>
                <p className="text-lg font-bold text-blue-600">Get Started</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        Budget: ${task.budget}
                      </span>
                      {task.expertId && (
                        <span className="text-sm text-gray-500">
                          Expert: {task.expertId.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(task.status)}
                    {task.status === 'accepted' && (
                      <Link
                        to={`/chat/${task._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Chat
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks yet. Create your first task to get started!</p>
              <Link
                to="/create-task"
                className="inline-flex items-center mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Link>
            </div>
          )}
        </div>

        {/* Available Experts */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Available Experts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {availableExperts.map((expert) => (
              <div key={expert._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={expert.avatar || `https://ui-avatars.com/api/?name=${expert.name}&background=random`}
                    alt={expert.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{expert.name}</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Available</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {expert.skills?.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">${expert.hourlyRate}/hr</span>
                    <span className="text-yellow-600">⭐ {expert.rating || 'New'}</span>
                  </div>
                </div>
                <Link
                  to={`/expert/${expert._id}`}
                  className="block w-full mt-4 bg-gray-100 text-gray-700 text-center py-2 rounded hover:bg-gray-200 text-sm"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
          
          {availableExperts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No experts available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;