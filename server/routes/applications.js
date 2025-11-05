import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

// Get all applications (admin) or user's applications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    
    const applications = await Application.find(query)
      .populate('userId', 'username email fullName')
      .populate('internshipId')
      .sort({ appliedDate: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'username email fullName')
      .populate('internshipId');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create application
router.post('/', async (req, res) => {
  try {
    const { userId, internshipId } = req.body;
    
    // Check if already applied
    const existingApp = await Application.findOne({ userId, internshipId });
    if (existingApp) {
      return res.status(400).json({ error: 'Already applied to this internship' });
    }

    const application = new Application(req.body);
    await application.save();
    
    const populatedApp = await Application.findById(application._id)
      .populate('userId', 'username email fullName')
      .populate('internshipId');
    
    res.status(201).json(populatedApp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update application (status, feedback)
router.put('/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'username email fullName')
     .populate('internshipId');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
