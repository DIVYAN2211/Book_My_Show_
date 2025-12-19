const express = require('express');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get shows by movie and city
router.get('/', async (req, res) => {
  try {
    const { movieId, city, date, theatreId } = req.query;
    let query = { status: 'active' };

    if (movieId) query.movie = movieId;
    if (theatreId) query.theatre = theatreId;

    let shows = await Show.find(query)
      .populate('movie', 'title duration language')
      .populate('theatre', 'name city address');

    // Filter by city if provided
    if (city) {
      shows = shows.filter(show => 
        show.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Filter by date if provided
    if (date) {
      const filterDate = new Date(date);
      shows = shows.filter(show => {
        const showDate = new Date(show.date);
        return showDate.toDateString() === filterDate.toDateString();
      });
    }

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get show by ID
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');
    
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

