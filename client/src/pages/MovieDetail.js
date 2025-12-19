import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
    fetchCities();
  }, [id]);

  useEffect(() => {
    if (selectedCity && movie) {
      fetchShows();
    }
  }, [selectedCity, movie]);

  const fetchMovie = async () => {
    try {
      const res = await axios.get(`/api/movies/${id}`);
      setMovie(res.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
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

  const fetchShows = async () => {
    try {
      const res = await axios.get('/api/shows', {
        params: { movieId: id, city: selectedCity }
      });
      setShows(res.data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return (
    <div className="movie-detail">
      <div className="container">
        <div className="movie-header">
          <div className="movie-poster-large">
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} />
            ) : (
              <div className="poster-placeholder">{movie.title}</div>
            )}
          </div>
          <div className="movie-details">
            <h1>{movie.title}</h1>
            <p className="movie-meta">
              {movie.genre.join(' • ')} • {movie.duration} min • {movie.language}
            </p>
            <p className="movie-rating">⭐ {movie.rating}/10</p>
            <p className="movie-description">{movie.description}</p>
            <p className="movie-release">
              Release Date: {new Date(movie.releaseDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="booking-section">
          <h2>Book Tickets</h2>
          <div className="city-selector">
            <label>Select City:</label>
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

          {selectedCity && shows.length > 0 && (
            <div className="shows-list">
              {shows.map(show => (
                <div key={show._id} className="show-card">
                  <div className="show-info">
                    <h3>{show.theatre.name}</h3>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;

