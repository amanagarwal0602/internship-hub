import express from 'express';
import Internship from '../models/Internship.js';

const router = express.Router();

// Get all internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get internship by ID
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    res.json(internship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create internship (admin only)
router.post('/', async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update internship
router.put('/:id', async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    res.json(internship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete internship
router.delete('/:id', async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
