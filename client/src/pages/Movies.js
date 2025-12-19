import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    genre: ''
  });

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  const fetchMovies = async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.genre) params.genre = filters.genre;

      const res = await axios.get('/api/movies', { params });
      setMovies(res.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movies-page">
      <div className="container">
        <h1>Movies</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="Search movies..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="">All Status</option>
            <option value="now-showing">Now Showing</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="input"
          >
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Thriller">Thriller</option>
            <option value="Horror">Horror</option>
            <option value="Romance">Romance</option>
          </select>
        </div>

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
      </div>
    </div>
  );
};

export default Movies;

