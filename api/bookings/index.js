const jwt = require('jsonwebtoken');
const Booking = require('../../server/models/Booking');
const Show = require('../../server/models/Show');
const User = require('../../server/models/User');
const mongoose = require('mongoose');

async function authMiddleware(req) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    return user;
  } catch (error) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const user = await authMiddleware(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const { showId, seats } = req.body;

      const show = await Show.findById(showId);
      if (!show) {
        return res.status(404).json({ message: 'Show not found' });
      }

      // Check seat availability
      for (const seat of seats) {
        const bookedSeat = show.bookedSeats.find(
          s => s.seatNumber === seat.seatNumber
        );
        if (bookedSeat) {
          return res.status(400).json({ 
            message: `Seat ${seat.seatNumber} is already booked` 
          });
        }
      }

      // Calculate total amount
      let totalAmount = 0;
      seats.forEach(seat => {
        totalAmount += seat.price;
      });

      // Create booking
      const booking = new Booking({
        user: user._id,
        show: showId,
        seats: seats,
        totalAmount: totalAmount,
        status: 'confirmed',
        bookingDate: new Date()
      });

      await booking.save();

      // Update show's booked seats
      seats.forEach(seat => {
        show.bookedSeats.push({
          seatNumber: seat.seatNumber,
          bookedBy: user._id,
          bookingId: booking._id
        });
      });
      await show.save();

      return res.status(201).json({
        booking: booking,
        message: 'Booking successful'
      });
    }

    if (req.method === 'GET') {
      const bookings = await Booking.find({ user: user._id })
        .populate('show')
        .populate('user', 'name email');
      
      return res.json(bookings);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
