const express = require('express');
const Theatre = require('../models/Theatre');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all theatres
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    let query = {};

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const theatres = await Theatre.find(query).populate('createdBy', 'name');
    res.json(theatres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cities
router.get('/cities', async (req, res) => {
  try {
    const cities = await Theatre.distinct('city');
    res.json(cities.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get theatre by ID
router.get('/:id', async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id).populate('createdBy', 'name');
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }
    res.json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

