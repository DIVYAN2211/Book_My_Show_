const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Process payment
router.post('/process', auth, async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentDetails } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    // Simulate payment processing
    // In production, integrate with payment gateway (Razorpay, Stripe, etc.)
    const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Simulate payment success (90% success rate)
    const paymentSuccess = Math.random() > 0.1;

    if (paymentSuccess) {
      booking.paymentStatus = 'completed';
      booking.paymentId = paymentId;
      booking.bookingStatus = 'confirmed';
      await booking.save();

      // Add notification
      const user = await User.findById(booking.user);
      if (user) {
        user.notifications.push({
          message: `Payment successful! Your ticket ${booking.ticketId} is confirmed.`,
          type: 'booking',
          read: false
        });
        await user.save();
      }

      res.json({
        success: true,
        message: 'Payment successful',
        booking,
        paymentId
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();

      // Release seats if payment fails
      const show = await Show.findById(booking.show);
      if (show) {
        show.bookedSeats = show.bookedSeats.filter(
          s => s.bookingId.toString() !== booking._id.toString()
        );
        await show.save();
      }

      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

