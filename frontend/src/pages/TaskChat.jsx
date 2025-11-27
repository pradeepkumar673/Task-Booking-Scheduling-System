import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const TaskChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const { taskId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTaskAndMessages();
    
    if (socket) {
      socket.emit('join_chat', taskId);
      
      socket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [taskId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTaskAndMessages = async () => {
    try {
      const [taskResponse, messagesResponse] = await Promise.all([
        axios.get(`/api/tasks/my-tasks`),
        axios.get(`/api/chat/${taskId}`)
      ]);

      const tasks = taskResponse.data.data.tasks;
      const currentTask = tasks.find(t => t._id === taskId);
      setTask(currentTask);
      setMessages(messagesResponse.data.data.messages || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/api/chat/${taskId}`, {
        content: newMessage
      });

      const message = response.data.data.message;
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Emit via socket
      if (socket) {
        socket.emit('send_message', {
          taskId,
          ...message
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherUser = () => {
    if (!task) return null;
    return user.role === 'user' ? task.expertId : task.userId;
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

  if (!task) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Task Not Found</h2>
            <p className="text-gray-600 mt-2">The task you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  const otherUser = getOtherUser();

  return (
    <>
      <Navbar />
      
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <img
                src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name}&background=random`}
                alt={otherUser?.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold text-gray-900">{otherUser?.name}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{task.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.senderId._id === user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId._id === user.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId._id === user.id
                      ? 'text-blue-200'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {task.status === 'accepted' || task.status === 'in-progress' ? (
          <form onSubmit={sendMessage} className="bg-white border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-yellow-50 border-t border-yellow-200 p-4 text-center">
            <p className="text-yellow-800">
              Chat will be available once the task is accepted by the expert.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskChat;