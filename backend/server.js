const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/experts', require('./routes/experts'));
app.use('/api/chat', require('./routes/chat'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join task chat room
  socket.on('join_chat', (taskId) => {
    socket.join(taskId);
    console.log(`User ${socket.id} joined chat room: ${taskId}`);
  });

  // Handle new messages
  socket.on('send_message', (data) => {
    socket.to(data.taskId).emit('new_message', data);
  });

  // Expert availability
  socket.on('expert_availability', (data) => {
    socket.broadcast.emit('expert_availability_changed', data);
  });

  // Task assignments
  socket.on('new_task_assignment', (data) => {
    socket.to(data.expertId).emit('task_assigned', data);
  });

  // Task status updates
  socket.on('task_status_update', (data) => {
    socket.broadcast.emit('task_status_updated', data);
  });

  // User online status
  socket.on('user_online', (userId) => {
    socket.userId = userId;
    console.log(`User ${userId} is online`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskbooking')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});