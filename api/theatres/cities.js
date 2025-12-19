const Theatre = require('../../server/models/Theatre');
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
      const cities = await Theatre.distinct('city');
      return res.json(cities);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: error.message });
  }
};
