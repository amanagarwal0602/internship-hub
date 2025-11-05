import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// Get all tasks for a user or application
router.get('/', async (req, res) => {
  try {
    const { userId, applicationId } = req.query;
    const query = {};
    
    if (userId) query.userId = userId;
    if (applicationId) query.applicationId = applicationId;
    
    const tasks = await Task.find(query)
      .populate('applicationId')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('applicationId');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    
    const populatedTask = await Task.findById(task._id).populate('applicationId');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task (toggle completed, add feedback)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('applicationId');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
