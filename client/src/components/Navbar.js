import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          BookMyShow
        </Link>
        <div className="navbar-menu">
          <Link to="/movies" className="navbar-link">Movies</Link>
          {user ? (
            <>
              <Link to="/my-bookings" className="navbar-link">My Bookings</Link>
              {(user.role === 'admin' || user.role === 'creator') && (
                <Link to="/admin" className="navbar-link">Admin Panel</Link>
              )}
              <span className="navbar-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

