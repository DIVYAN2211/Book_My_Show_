const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true
  },
  screen: {
    name: String,
    capacity: Number
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true 
  },
  price: {
    regular: Number,
    premium: Number,
    vip: Number
  },
  availableSeats: {
    type: Map,
    of: {
      seatNumber: String,
      available: Boolean,
      booked: Boolean
    },
    default: new Map()
  },
  bookedSeats: [{
    seatNumber: String,
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Show', showSchema);   