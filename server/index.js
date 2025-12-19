const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Only run in local development
if (process.env.NODE_ENV !== 'production') {
  const app = express();
  const server = http.createServer(app);
  const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL || "http://localhost:3000"
  ];

  const io = socketIo(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"]
    }
  });


  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/movies', require('./routes/movies'));
  app.use('/api/theatres', require('./routes/theatres'));
  app.use('/api/shows', require('./routes/shows'));
  app.use('/api/bookings', require('./routes/bookings'));
  app.use('/api/payments', require('./routes/payments'));
  app.use('/api/admin', require('./routes/admin'));


  const activeSelections = new Map(); 

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('select-seat', async (data) => {
      const { showId, seatId, userId } = data;
      const key = `${showId}-${seatId}`;
   
      activeSelections.set(key, {
        userId,
        socketId: socket.id,
        timestamp: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 
      });


      io.emit('seat-selected', { showId, seatId, userId });
    });

    socket.on('release-seat', (data) => {
      const { showId, seatId } = data;
      const key = `${showId}-${seatId}`;
      activeSelections.delete(key);
      io.emit('seat-released', { showId, seatId });
    });

    socket.on('disconnect', () => {
      
      for (const [key, value] of activeSelections.entries()) {
        if (value.socketId === socket.id) {
          const [showId, seatId] = key.split('-');
          activeSelections.delete(key);
          io.emit('seat-released', { showId, seatId });
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });

  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of activeSelections.entries()) {
      if (value.expiresAt < now) {
        const [showId, seatId] = key.split('-');
        activeSelections.delete(key);
        io.emit('seat-released', { showId, seatId });
      }
    }
  }, 60000);

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  module.exports = { io, activeSelections };
}

