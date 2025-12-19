import Movie from '../../server/models/Movie';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid movie ID' });
      }

      const movie = await Movie.findById(id);
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }

      return res.json(movie);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
