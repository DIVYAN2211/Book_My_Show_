import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const fetchMovies = async () => {
    try {
      const res = await axios.get('/api/movies', {
        params: { status: 'now-showing', city: selectedCity }
      });
      setMovies(res.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get('/api/theatres/cities');
      setCities(res.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Book Your Movie Tickets Online</h1>
          <p>Experience the magic of cinema</p>
          <div className="city-selector">
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input"
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">Now Showing</h2>
        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : (
          <div className="movies-grid">
            {movies.map(movie => (
              <Link key={movie._id} to={`/movies/${movie._id}`} className="movie-card">
                <div className="movie-poster">
                  {movie.poster ? (
                    <img src={movie.poster} alt={movie.title} />
                  ) : (
                    <div className="poster-placeholder">{movie.title}</div>
                  )}
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-genre">{movie.genre.join(', ')}</p>
                  <p className="movie-rating">⭐ {movie.rating}/10</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center" style={{ marginTop: '30px' }}>
          <Link to="/movies" className="btn btn-primary">View All Movies</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

