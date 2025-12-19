const express = require('express');
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');
const cache = require('../utils/cache');

const router = express.Router();

// Get all movies
router.get('/', async (req, res) => {
  try {
    const { city, status, genre, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (genre) query.genre = { $in: [genre] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const cacheKey = cache.buildKey(['movies', JSON.stringify(query)]);
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const movies = await Movie.find(query)
      .populate('createdBy', 'name')
      .sort({ releaseDate: -1 });

    cache.set(cacheKey, movies, 60 * 1000);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = cache.buildKey(['movie', req.params.id]);
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const movie = await Movie.findById(req.params.id).populate('createdBy', 'name');
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    cache.set(cacheKey, movie, 60 * 1000);
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

