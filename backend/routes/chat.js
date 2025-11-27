const express = require('express');
const Message = require('../models/Message');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();

// Get messages for a task
router.get('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is part of this task
    if (req.user.id !== task.userId.toString() && req.user.id !== task.expertId?.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ taskId: req.params.taskId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    res.json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send message
router.post('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is part of this task and task is accepted
    if ((req.user.id !== task.userId.toString() && req.user.id !== task.expertId?.toString()) || 
        task.status !== 'accepted') {
      return res.status(403).json({ message: 'Not authorized or task not accepted' });
    }

    const receiverId = req.user.id === task.userId.toString() ? task.expertId : task.userId;

    const message = await Message.create({
      taskId: req.params.taskId,
      senderId: req.user.id,
      receiverId,
      content: req.body.content,
      attachment: req.body.attachment
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: { message: populatedMessage }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;