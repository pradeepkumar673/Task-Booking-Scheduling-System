import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineExperts, setOnlineExperts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('user_online', user.id);

      newSocket.on('expert_availability_changed', (data) => {
        setOnlineExperts(prev => {
          const existing = prev.find(e => e.id === data.id);
          if (existing) {
            return prev.map(e => e.id === data.id ? data : e);
          }
          return [...prev, data];
        });
      });

      newSocket.on('task_assigned', (data) => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'task_assigned',
          message: `New task assigned: ${data.title}`,
          taskId: data.taskId
        }]);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    socket,
    onlineExperts,
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
