const Show = require('../../../server/models/Show');
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

    const { id } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid show ID' });
    }

    if (req.method === 'GET') {
      const show = await Show.findById(id)
        .populate('movie')
        .populate('theatre');
      
      if (!show) {
        return res.status(404).json({ message: 'Show not found' });
      }

      return res.json(show);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
