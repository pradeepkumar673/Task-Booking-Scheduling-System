import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Clock, CheckCircle, XCircle, AlertCircle, Play, Pause, StopCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';

const ExpertDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchTasks();
    fetchAvailableTasks();
    if (user) {
      setIsAvailable(user.isAvailable || false);
    }
  }, [user]);

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

  const fetchAvailableTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/available');
      setAvailableTasks(response.data.data.tasks);
    } catch (error) {
      console.error('Error fetching available tasks:', error);
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      const newAvailability = !isAvailable;
      await axios.patch('/api/experts/availability', { 
        isAvailable: newAvailability 
      });
      setIsAvailable(newAvailability);
      
      // Broadcast availability change
      if (socket) {
        socket.emit('expert_availability', {
          id: user.id,
          isAvailable: newAvailability,
          name: user.name,
          avatar: user.avatar,
          skills: user.skills,
          rating: user.rating,
          hourlyRate: user.hourlyRate
        });
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleTaskAction = async (taskId, action) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { 
        status: action 
      });
      
      // Refresh tasks
      fetchTasks();
      fetchAvailableTasks();
      
      // Notify user about task status change
      if (socket) {
        socket.emit('task_status_update', {
          taskId,
          status: action,
          expertId: user.id
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { 
        status: 'accepted' 
      });
      
      // Refresh tasks
      fetchTasks();
      fetchAvailableTasks();
      
      // Notify user
      if (socket) {
        socket.emit('task_status_update', {
          taskId,
          status: 'accepted',
          expertId: user.id
        });
      }
    } catch (error) {
      console.error('Error accepting task:', error);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expert Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                isAvailable 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {isAvailable ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Available Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{availableTasks.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Play className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Available Tasks */}
        {isAvailable && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Available Tasks</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {availableTasks.map((task) => (
                <div key={task._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {task.category.join(', ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          Budget: ${task.budget}
                        </span>
                        <span className="text-sm text-gray-500">
                          Client: {task.userId.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptTask(task._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleTaskAction(task._id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {availableTasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No available tasks matching your skills.</p>
              </div>
            )}
          </div>
        )}

        {/* My Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
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
                      <span className="text-sm text-gray-500">
                        Client: {task.userId.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(task.status)}
                    
                    {task.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => handleTaskAction(task._id, 'accepted')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleTaskAction(task._id, 'rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {task.status === 'accepted' && (
                      <button
                        onClick={() => handleTaskAction(task._id, 'in-progress')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Start Work
                      </button>
                    )}
                    
                    {task.status === 'in-progress' && (
                      <button
                        onClick={() => handleTaskAction(task._id, 'completed')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                    
                    {(task.status === 'accepted' || task.status === 'in-progress') && (
                      <a
                        href={`/chat/${task._id}`}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                      >
                        Chat
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks assigned to you yet.</p>
              <p className="text-gray-500 mt-1">Toggle availability to receive tasks.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpertDashboard;