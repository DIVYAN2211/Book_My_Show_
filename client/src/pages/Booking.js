import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './Booking.css';

// Only connect to socket in development
const socket = process.env.NODE_ENV === 'development' ? io('http://localhost:5000') : null;

const Booking = () => {
  const { id: showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchShow();

    if (socket) {
      socket.on('seat-selected', (data) => {
        if (data.showId === showId && data.userId !== user?.id) {
          setLockedSeats(prev => new Set([...prev, data.seatId]));
        }
      });

      socket.on('seat-released', (data) => {
        if (data.showId === showId) {
          setLockedSeats(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.seatId);
            return newSet;
          });
        }
      });

      return () => {
        socket.off('seat-selected');
        socket.off('seat-released');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId, user]);

  const fetchShow = async () => {
    try {
      const res = await axios.get(`/api/shows/${showId}`);
      setShow(res.data);
    } catch (error) {
      console.error('Error fetching show:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatNumber, seatType, price) => {
    if (lockedSeats.has(seatNumber)) return;

    const isBooked = show.bookedSeats.some(s => s.seatNumber === seatNumber);
    if (isBooked) return;

    const index = selectedSeats.findIndex(s => s.seatNumber === seatNumber);
    if (index > -1) {
      setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seatNumber));
      socket.emit('release-seat', { showId, seatId: seatNumber });
    } else {
      const newSeat = { seatNumber, seatType, price };
      setSelectedSeats([...selectedSeats, newSeat]);
      socket.emit('select-seat', { showId, seatId: seatNumber, userId: user?.id });
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      const res = await axios.post('/api/bookings', {
        showId,
        seats: selectedSeats
      });
      setBooking(res.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    setProcessingPayment(true);
    try {
      const res = await axios.post('/api/payments/process', {
        bookingId: booking._id,
        paymentMethod: 'card'
      });

      if (res.data.success) {
        alert('Payment successful! Your ticket is confirmed.');
        navigate('/my-bookings');
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!show) {
    return <div>Show not found</div>;
  }

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="booking-page">
      <div className="container">
        <h1>Select Seats</h1>
        <div className="booking-info">
          <h2>{show.movie.title}</h2>
          <p>{show.theatre.name} - {show.theatre.city}</p>
          <p>{new Date(show.date).toLocaleDateString()} at {show.time}</p>
        </div>

        <div className="seat-map-container">
          <div className="screen">SCREEN</div>
          <div className="seat-map">
            {Array.from({ length: 10 }, (_, row) => (
              <div key={row} className="seat-row">
                <span className="row-label">{String.fromCharCode(65 + row)}</span>
                {Array.from({ length: 15 }, (_, col) => {
                  const seatNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
                  const isBooked = show.bookedSeats.some(s => s.seatNumber === seatNumber);
                  const isSelected = selectedSeats.some(s => s.seatNumber === seatNumber);
                  const isLocked = lockedSeats.has(seatNumber);
                  const seatType = row < 3 ? 'premium' : row < 7 ? 'regular' : 'vip';
                  const price = show.price[seatType] || show.price.regular;

                  return (
                    <button
                      key={col}
                      className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => !isBooked && !isLocked && handleSeatClick(seatNumber, seatType, price)}
                      disabled={isBooked || isLocked}
                    >
                      {col + 1}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat booked"></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="seat locked"></div>
            <span>Locked</span>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="booking-summary">
            <h3>Selected Seats: {selectedSeats.map(s => s.seatNumber).join(', ')}</h3>
            <h3>Total Amount: ₹{totalAmount}</h3>
            {!booking ? (
              <button onClick={handleBooking} className="btn btn-primary">
                Proceed to Payment
              </button>
            ) : (
              <div>
                <p>Booking ID: {booking.ticketId}</p>
                <button
                  onClick={handlePayment}
                  className="btn btn-primary"
                  disabled={processingPayment || booking.paymentStatus === 'completed'}
                >
                  {processingPayment ? 'Processing...' : booking.paymentStatus === 'completed' ? 'Paid' : 'Pay Now'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;

