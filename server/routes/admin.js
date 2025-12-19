const express = require('express');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin/creator role
router.use(auth);
router.use(authorize('admin', 'creator'));

// Movie management
router.post('/movies', async (req, res) => {
  try {
    const movie = new Movie({
      ...req.body,
      createdBy: req.user._id
    });
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user is creator or admin
    if (movie.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(movie, req.body);
    await movie.save();
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (movie.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await movie.deleteOne();
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Theatre management
router.post('/theatres', async (req, res) => {
  try {
    const theatre = new Theatre({
      ...req.body,
      createdBy: req.user._id
    });
    await theatre.save();
    res.status(201).json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/theatres/:id', async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    if (theatre.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(theatre, req.body);
    await theatre.save();
    res.json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Show management
router.post('/shows', async (req, res) => {
  try {
    const { movieId, theatreId, screen, date, time, price } = req.body;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    const selectedScreen = theatre.screens.find(s => s.name === screen);
    if (!selectedScreen) {
      return res.status(400).json({ message: 'Screen not found' });
    }

    // Initialize seat map
    const availableSeats = new Map();
    for (let row = 0; row < selectedScreen.seatLayout.rows; row++) {
      for (let col = 0; col < selectedScreen.seatLayout.seatsPerRow; col++) {
        const seat = selectedScreen.seatLayout.seatMap[row][col];
        if (seat) {
          availableSeats.set(seat.seatNumber, {
            seatNumber: seat.seatNumber,
            available: true,
            booked: false
          });
        }
      }
    }

    const show = new Show({
      movie: movieId,
      theatre: theatreId,
      screen: {
        name: selectedScreen.name,
        capacity: selectedScreen.capacity
      },
      date,
      time,
      price,
      availableSeats
    });

    await show.save();
    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    res.json(user.notifications || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

