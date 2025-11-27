const express = require('express');
const Task = require('../models/task');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can create tasks' });
    }

    const task = await Task.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's tasks
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'user' 
      ? { userId: req.user.id }
      : { expertId: req.user.id };

    const tasks = await Task.find(filter)
      .populate('userId', 'name avatar')
      .populate('expertId', 'name avatar skills rating')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: tasks.length,
      data: { tasks }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get available tasks for experts
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.role !== 'expert') {
      return res.status(403).json({ message: 'Only experts can view available tasks' });
    }

    const tasks = await Task.find({
      status: 'pending',
      category: { $in: req.user.skills }
    })
      .populate('userId', 'name avatar rating')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: tasks.length,
      data: { tasks }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'expert' && task.expertId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'user' && task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    
    if (status === 'accepted') {
      task.acceptedAt = new Date();
    } else if (status === 'in-progress') {
      task.startedAt = new Date();
    } else if (status === 'completed') {
      task.completedAt = new Date();
    }

    await task.save();

    res.json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign task to expert
router.patch('/:id/assign', auth, async (req, res) => {
  try {
    const { expertId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.expertId = expertId;
    task.status = 'assigned';
    task.assignedAt = new Date();

    await task.save();

    res.json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;