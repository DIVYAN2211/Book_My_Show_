const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  screens: [{
    name: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true
    },
    seatLayout: {
      rows: Number,
      seatsPerRow: Number,
      seatMap: [[{
        seatNumber: String,
        seatType: {
          type: String,
          enum: ['regular', 'premium', 'vip'],
          default: 'regular'
        },
        price: Number
      }]]
    }
  }],
  amenities: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Theatre', theatreSchema);

