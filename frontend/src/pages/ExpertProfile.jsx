import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Star, Clock, CheckCircle, Award, MessageCircle } from 'lucide-react';
import axios from 'axios';

const ExpertProfile = () => {
  const [expert, setExpert] = useState(null);
  const [pastProjects, setPastProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    fetchExpertProfile();
  }, [id]);

  const fetchExpertProfile = async () => {
    try {
      const response = await axios.get(`/api/experts/${id}`);
      setExpert(response.data.data.expert);
      setPastProjects(response.data.data.pastProjects || []);
    } catch (error) {
      console.error('Error fetching expert profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-gray-600">({rating})</span>
      </div>
    );
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

  if (!expert) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Expert Not Found</h2>
            <p className="text-gray-600 mt-2">The expert profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Expert Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start space-x-6">
            <img
              src={expert.avatar || `https://ui-avatars.com/api/?name=${expert.name}&background=random`}
              alt={expert.name}
              className="w-24 h-24 rounded-full"
            />
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{expert.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    {renderStars(expert.rating)}
                    <span className="text-gray-600">{expert.completedTasks} tasks completed</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {expert.isAvailable ? (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Available Now</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-sm font-medium">Unavailable</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">${expert.hourlyRate}/hour</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{expert.completedTasks} Completed</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-700">{expert.rating || 'New'} Rating</span>
                </div>
              </div>
              
              <p className="text-gray-700">{expert.bio || 'No bio provided yet.'}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {expert.skills?.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Past Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Projects</h2>
          
          {pastProjects.length > 0 ? (
            <div className="space-y-4">
              {pastProjects.map((project) => (
                <div key={project._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(project.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{project.description}</p>
                  
                  {project.review && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < project.review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">by {project.userId.name}</span>
                      </div>
                      {project.review.comment && (
                        <p className="text-gray-700 text-sm">{project.review.comment}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No past projects to display yet.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <Link
            to="/create-task"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Hire {expert.name}</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ExpertProfile;