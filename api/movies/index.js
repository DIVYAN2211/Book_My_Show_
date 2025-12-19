const Movie = require('../../server/models/Movie');
const mongoose = require('mongoose');

module.exports = async function handler(req, res) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    if (req.method === 'GET') {
      const { genre, language, rating } = req.query;
      let filter = {};

      if (genre) filter.genre = genre;
      if (language) filter.language = language;
      if (rating) filter.rating = { $gte: parseFloat(rating) };

      const movies = await Movie.find(filter);
      return res.json(movies);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
