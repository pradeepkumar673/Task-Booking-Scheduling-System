import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Plus, X, Calendar } from 'lucide-react';
import axios from 'axios';

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: [],
    budget: '',
    estimatedHours: '',
    timeline: '',
    assignTo: 'open' // 'open' or 'specific'
  });
  const [selectedExpert, setSelectedExpert] = useState('');
  const [availableExperts, setAvailableExperts] = useState([]);
  const [skills, setSkills] = useState(['Web Development', 'Graphic Design', 'Content Writing', 'Digital Marketing', 'Mobile Development', 'UI/UX Design', 'Data Analysis', 'SEO']);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { socket, onlineExperts } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableExperts();
  }, []);

  useEffect(() => {
    setAvailableExperts(onlineExperts);
  }, [onlineExperts]);

  const fetchAvailableExperts = async () => {
    try {
      const response = await axios.get('/api/experts/available');
      setAvailableExperts(response.data.data.experts);
    } catch (error) {
      console.error('Error fetching experts:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(skill)
        ? prev.category.filter(s => s !== skill)
        : [...prev.category, skill]
    }));
  };

  const addNewSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills(prev => [...prev, newSkill]);
      setNewSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        budget: parseFloat(formData.budget),
        estimatedHours: parseInt(formData.estimatedHours),
        timeline: new Date(formData.timeline)
      };

      const response = await axios.post('/api/tasks', taskData);
      const task = response.data.data.task;

      // If assigning to specific expert
      if (formData.assignTo === 'specific' && selectedExpert) {
        await axios.patch(`/api/tasks/${task._id}/assign`, {
          expertId: selectedExpert
        });

        // Notify expert via socket
        if (socket) {
          socket.emit('new_task_assignment', {
            taskId: task._id,
            expertId: selectedExpert,
            title: task.title,
            userId: user.id
          });
        }
      }

      navigate('/user-dashboard');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-600">Post a task and find the right expert for your project</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Build a responsive website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your task in detail..."
            />
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills Required *
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.category.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add custom skill"
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={addNewSkill}
                  className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($) *
              </label>
              <input
                type="number"
                name="budget"
                required
                min="1"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours *
              </label>
              <input
                type="number"
                name="estimatedHours"
                required
                min="1"
                value={formData.estimatedHours}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Timeline *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="timeline"
                required
                value={formData.timeline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Assignment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Assign To
            </label>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="assignTo"
                  value="open"
                  checked={formData.assignTo === 'open'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span>Post as open task (visible to all available experts)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="assignTo"
                  value="specific"
                  checked={formData.assignTo === 'specific'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span>Assign to specific expert</span>
              </label>
            </div>
          </div>

          {/* Expert Selection */}
          {formData.assignTo === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Expert *
              </label>
              <select
                value={selectedExpert}
                onChange={(e) => setSelectedExpert(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an expert...</option>
                {availableExperts.map((expert) => (
                  <option key={expert._id} value={expert._id}>
                    {expert.name} - {expert.skills?.join(', ')} - ${expert.hourlyRate}/hr
                  </option>
                ))}
              </select>
              
              {availableExperts.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No experts available at the moment. Try posting as an open task.
                </p>
              )}
            </div>
          )}

          {/* Available Experts Preview */}
          {formData.assignTo === 'open' && availableExperts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Experts ({availableExperts.length})
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2">
                {availableExperts.map((expert) => (
                  <div key={expert._id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={expert.avatar || `https://ui-avatars.com/api/?name=${expert.name}&background=random`}
                        alt={expert.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{expert.name}</h4>
                        <p className="text-sm text-gray-600">${expert.hourlyRate}/hr</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {expert.skills?.slice(0, 2).map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/user-dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTask;