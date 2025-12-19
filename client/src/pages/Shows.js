import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Shows.css';

const Shows = () => {
  const [shows, setShows] = useState([]);
  const [cities, setCities] = useState([]);
  const [movies, setMovies] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    movieId: '',
    date: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCities();
    fetchMovies();
  }, []);

  useEffect(() => {
    if (filters.city || filters.movieId) {
      fetchShows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCities = async () => {
    try {
      const res = await axios.get('/api/theatres/cities');
      setCities(res.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await axios.get('/api/movies', { params: { status: 'now-showing' } });
      setMovies(res.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchShows = async () => {
    try {
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.movieId) params.movieId = filters.movieId;
      if (filters.date) params.date = filters.date;

      const res = await axios.get('/api/shows', { params });
      setShows(res.data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    }
  };

  return (
    <div className="shows-page">
      <div className="container">
        <h1>Find Shows</h1>
        <div className="filters">
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="input"
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={filters.movieId}
            onChange={(e) => setFilters({ ...filters, movieId: e.target.value })}
            className="input"
          >
            <option value="">Select Movie</option>
            {movies.map(movie => (
              <option key={movie._id} value={movie._id}>{movie.title}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="input"
          />
        </div>

        <div className="shows-list">
          {shows.map(show => (
            <div key={show._id} className="show-card">
              <div className="show-info">
                <h3>{show.movie.title}</h3>
                <p>{show.theatre.name} - {show.theatre.city}</p>
                <p>{show.theatre.address}</p>
                <p>Screen: {show.screen.name}</p>
              </div>
              <div className="show-time">
                <p>{new Date(show.date).toLocaleDateString()}</p>
                <p className="time">{show.time}</p>
                <button
                  onClick={() => navigate(`/booking/${show._id}`)}
                  className="btn btn-primary"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shows;

