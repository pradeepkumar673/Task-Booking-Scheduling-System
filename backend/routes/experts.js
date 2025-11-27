const express = require('express');
const User = require('../models/User');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();

// Get available experts
router.get('/available', auth, async (req, res) => {
  try {
    const experts = await User.find({
      role: 'expert',
      isAvailable: true
    }).select('name avatar skills rating hourlyRate bio completedTasks');

    res.json({
      status: 'success',
      results: experts.length,
      data: { experts }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get expert profile
router.get('/:id', async (req, res) => {
  try {
    const expert = await User.findById(req.params.id);
    
    if (!expert || expert.role !== 'expert') {
      return res.status(404).json({ message: 'Expert not found' });
    }

    const completedTasks = await Task.find({
      expertId: req.params.id,
      status: 'completed'
    })
      .populate('userId', 'name avatar')
      .select('title description review completedAt');

    res.json({
      status: 'success',
      data: {
        expert: {
          id: expert._id,
          name: expert.name,
          avatar: expert.avatar,
          skills: expert.skills,
          rating: expert.rating,
          hourlyRate: expert.hourlyRate,
          bio: expert.bio,
          completedTasks: expert.completedTasks,
          isAvailable: expert.isAvailable
        },
        pastProjects: completedTasks
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update expert availability
router.patch('/availability', auth, async (req, res) => {
  try {
    if (req.user.role !== 'expert') {
      return res.status(403).json({ message: 'Only experts can update availability' });
    }

    const { isAvailable } = req.body;
    const expert = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    );

    res.json({
      status: 'success',
      data: { expert }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update expert profile
router.patch('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'expert') {
      return res.status(403).json({ message: 'Only experts can update profile' });
    }

    const allowedUpdates = ['skills', 'bio', 'hourlyRate', 'avatar'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const expert = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: { expert }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;