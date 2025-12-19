const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  seats: [{
    seatNumber: String,
    seatType: String,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'expired'],
    default: 'confirmed'
  },
  ticketId: {
    type: String,
    unique: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
});

bookingSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    this.ticketId = `TKT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

