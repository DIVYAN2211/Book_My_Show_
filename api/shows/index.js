const Show = require('../../server/models/Show');
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

      return res.json(shows);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
