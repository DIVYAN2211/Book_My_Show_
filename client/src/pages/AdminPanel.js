import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    if (activeTab === 'movies') fetchMovies();
    if (activeTab === 'theatres') fetchTheatres();
  }, [activeTab]);

  const fetchMovies = async () => {
    try {
      const res = await axios.get('/api/movies');
      setMovies(res.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchTheatres = async () => {
    try {
      const res = await axios.get('/api/theatres');
      setTheatres(res.data);
    } catch (error) {
      console.error('Error fetching theatres:', error);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const movieData = {
      title: formData.get('title'),
      description: formData.get('description'),
      genre: formData.get('genre').split(',').map(g => g.trim()),
      duration: parseInt(formData.get('duration')),
      language: formData.get('language'),
      releaseDate: formData.get('releaseDate'),
      rating: parseFloat(formData.get('rating')),
      status: formData.get('status')
    };

    try {
      await axios.post('/api/admin/movies', movieData);
      alert('Movie added successfully');
      e.target.reset();
      fetchMovies();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add movie');
    }
  };

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const theatreData = {
      name: formData.get('name'),
      city: formData.get('city'),
      address: formData.get('address'),
      screens: [{
        name: formData.get('screenName'),
        capacity: parseInt(formData.get('capacity')),
        seatLayout: {
          rows: 10,
          seatsPerRow: 15,
          seatMap: generateSeatMap(10, 15)
        }
      }]
    };

    try {
      await axios.post('/api/admin/theatres', theatreData);
      alert('Theatre added successfully');
      e.target.reset();
      fetchTheatres();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add theatre');
    }
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const showData = {
      movieId: formData.get('movieId'),
      theatreId: formData.get('theatreId'),
      screen: formData.get('screen'),
      date: formData.get('date'),
      time: formData.get('time'),
      price: {
        regular: parseFloat(formData.get('regularPrice')),
        premium: parseFloat(formData.get('premiumPrice')),
        vip: parseFloat(formData.get('vipPrice'))
      }
    };

    try {
      await axios.post('/api/admin/shows', showData);
      alert('Show added successfully');
      e.target.reset();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add show');
    }
  };

  const generateSeatMap = (rows, seatsPerRow) => {
    const seatMap = [];
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
        const seatType = row < 3 ? 'premium' : row < 7 ? 'regular' : 'vip';
        rowSeats.push({
          seatNumber,
          seatType,
          price: seatType === 'premium' ? 300 : seatType === 'vip' ? 500 : 200
        });
      }
      seatMap.push(rowSeats);
    }
    return seatMap;
  };

  return (
    <div className="admin-panel">
      <div className="container">
        <h1>Admin Panel</h1>
        <div className="tabs">
          <button
            className={activeTab === 'movies' ? 'active' : ''}
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </button>
          <button
            className={activeTab === 'theatres' ? 'active' : ''}
            onClick={() => setActiveTab('theatres')}
          >
            Theatres
          </button>
          <button
            className={activeTab === 'shows' ? 'active' : ''}
            onClick={() => setActiveTab('shows')}
          >
            Shows
          </button>
        </div>

        {activeTab === 'movies' && (
          <div className="admin-section">
            <h2>Add Movie</h2>
            <form onSubmit={handleAddMovie} className="admin-form">
              <input type="text" name="title" placeholder="Movie Title" className="input" required />
              <textarea name="description" placeholder="Description" className="input" required />
              <input type="text" name="genre" placeholder="Genres (comma separated)" className="input" required />
              <input type="number" name="duration" placeholder="Duration (minutes)" className="input" required />
              <input type="text" name="language" placeholder="Language" className="input" required />
              <input type="date" name="releaseDate" className="input" required />
              <input type="number" name="rating" placeholder="Rating (0-10)" step="0.1" className="input" />
              <select name="status" className="input" required>
                <option value="upcoming">Upcoming</option>
                <option value="now-showing">Now Showing</option>
                <option value="ended">Ended</option>
              </select>
              <button type="submit" className="btn btn-primary">Add Movie</button>
            </form>

            <h2>All Movies</h2>
            <div className="admin-list">
              {movies.map(movie => (
                <div key={movie._id} className="admin-item">
                  <h3>{movie.title}</h3>
                  <p>{movie.genre.join(', ')} • {movie.duration} min</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'theatres' && (
          <div className="admin-section">
            <h2>Add Theatre</h2>
            <form onSubmit={handleAddTheatre} className="admin-form">
              <input type="text" name="name" placeholder="Theatre Name" className="input" required />
              <input type="text" name="city" placeholder="City" className="input" required />
              <input type="text" name="address" placeholder="Address" className="input" required />
              <input type="text" name="screenName" placeholder="Screen Name" className="input" required />
              <input type="number" name="capacity" placeholder="Capacity" className="input" required />
              <button type="submit" className="btn btn-primary">Add Theatre</button>
            </form>

            <h2>All Theatres</h2>
            <div className="admin-list">
              {theatres.map(theatre => (
                <div key={theatre._id} className="admin-item">
                  <h3>{theatre.name}</h3>
                  <p>{theatre.city} • {theatre.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shows' && (
          <div className="admin-section">
            <h2>Add Show</h2>
            <form onSubmit={handleAddShow} className="admin-form">
              <select name="movieId" className="input" required>
                <option value="">Select Movie</option>
                {movies.map(movie => (
                  <option key={movie._id} value={movie._id}>{movie.title}</option>
                ))}
              </select>
              <select name="theatreId" className="input" required>
                <option value="">Select Theatre</option>
                {theatres.map(theatre => (
                  <option key={theatre._id} value={theatre._id}>{theatre.name}</option>
                ))}
              </select>
              <input type="text" name="screen" placeholder="Screen Name" className="input" required />
              <input type="date" name="date" className="input" required />
              <input type="time" name="time" className="input" required />
              <input type="number" name="regularPrice" placeholder="Regular Price" className="input" required />
              <input type="number" name="premiumPrice" placeholder="Premium Price" className="input" required />
              <input type="number" name="vipPrice" placeholder="VIP Price" className="input" required />
              <button type="submit" className="btn btn-primary">Add Show</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

