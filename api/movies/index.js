const Movie = require('../../server/models/Movie');
const mongoose = require('mongoose');

module.exports = async function handler(req, res) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      } catch (dbError) {
        console.error('Database connection error:', dbError.message);
        return res.status(500).json({ message: 'Database connection failed: ' + dbError.message });
      }
    }

    if (req.method === 'GET') {
      const { genre, language, rating, status, city, search } = req.query;
      let filter = {};

      if (genre) filter.genre = genre;
      if (language) filter.language = language;
      if (rating) filter.rating = { $gte: parseFloat(rating) };
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const movies = await Movie.find(filter).limit(100);
      return res.json(movies || []);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Movies endpoint error:', error.message);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};
