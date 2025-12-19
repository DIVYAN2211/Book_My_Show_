const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { io, activeSelections } = require('../index');

const router = express.Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { showId, seats } = req.body;

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Check seat availability and lock
    for (const seat of seats) {
      const key = `${showId}-${seat.seatNumber}`;
      const locked = activeSelections.get(key);
      
      if (locked && locked.userId !== req.user._id.toString()) {
        return res.status(400).json({ 
          message: `Seat ${seat.seatNumber} is currently being booked by another user` 
        });
      }

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
      user: req.user._id,
      show: showId,
      seats,
      totalAmount,
      paymentStatus: 'pending'
    });

    await booking.save();

    // Reserve seats temporarily (will be confirmed after payment)
    seats.forEach(seat => {
      show.bookedSeats.push({
        seatNumber: seat.seatNumber,
        bookingId: booking._id
      });
    });

    await show.save();

    // Release locks
    seats.forEach(seat => {
      const key = `${showId}-${seat.seatNumber}`;
      activeSelections.delete(key);
      io.emit('seat-released', { showId, seatId: seat.seatNumber });
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('show')
      .populate({
        path: 'show',
        populate: { path: 'movie theatre' }
      })
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('show')
      .populate({
        path: 'show',
        populate: { path: 'movie theatre' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    booking.paymentStatus = 'refunded';

    await booking.save();

    // Release seats
    const show = await Show.findById(booking.show);
    if (show) {
      show.bookedSeats = show.bookedSeats.filter(
        s => s.bookingId.toString() !== booking._id.toString()
      );
      await show.save();

      // Notify via WebSocket
      booking.seats.forEach(seat => {
        io.emit('seat-released', { 
          showId: booking.show.toString(), 
          seatId: seat.seatNumber 
        });
      });
    }

    // Add notification
    const user = await User.findById(booking.user);
    if (user) {
      user.notifications.push({
        message: `Your booking ${booking.ticketId} has been cancelled`,
        type: 'cancellation',
        read: false
      });
      await user.save();
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

