const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const expertRoutes = require('./routes/experts');
const chatRoutes = require('./routes/chat');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskbooking')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Socket.io for real-time features
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_online', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
  });

  socket.on('expert_availability', (data) => {
    socket.broadcast.emit('expert_availability_changed', data);
  });

  socket.on('new_task_assignment', (data) => {
    const expertSocketId = activeUsers.get(data.expertId);
    if (expertSocketId) {
      io.to(expertSocketId).emit('task_assigned', data);
    }
  });

  socket.on('task_status_update', (data) => {
    socket.broadcast.emit('task_updated', data);
  });

  socket.on('join_chat', (taskId) => {
    socket.join(taskId);
  });

  socket.on('send_message', (data) => {
    io.to(data.taskId).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});