import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './MyBookings.css';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await axios.post(`/api/bookings/${bookingId}/cancel`, {
        reason: 'User requested cancellation'
      });
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="my-bookings">
      <div className="container">
        <h1>My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You have no bookings yet.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h2>{booking.show.movie.title}</h2>
                  <span className={`status ${booking.bookingStatus}`}>
                    {booking.bookingStatus}
                  </span>
                </div>
                <div className="booking-details">
                  <p><strong>Theatre:</strong> {booking.show.theatre.name}</p>
                  <p><strong>Location:</strong> {booking.show.theatre.city}</p>
                  <p><strong>Date:</strong> {new Date(booking.show.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {booking.show.time}</p>
                  <p><strong>Seats:</strong> {booking.seats.map(s => s.seatNumber).join(', ')}</p>
                  <p><strong>Amount:</strong> ₹{booking.totalAmount}</p>
                  <p><strong>Ticket ID:</strong> {booking.ticketId}</p>
                  <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
                </div>
                {booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'completed' && (
                  <div className="booking-actions">
                    <button
                      onClick={() => window.print()}
                      className="btn btn-primary"
                    >
                      Print Ticket
                    </button>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="btn btn-danger"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

