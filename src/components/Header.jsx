// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearUserSession, getUserSession } from '../api/api';

function Header({ currentUser, setCurrentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState(currentUser);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { user } = getUserSession();
    if (user) {
      setLocalUser(user);
      if (setCurrentUser) setCurrentUser(user);
    } else {
      setLocalUser(null);
    }
  }, [currentUser, setCurrentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUserSession();
    setLocalUser(null);
    if (setCurrentUser) setCurrentUser(null);
    setMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          feed
        </Link>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link className="btn primary" to="/create">
            <span>✨ Create</span>
          </Link>
          <div className="user-menu" ref={menuRef}>
            <button className="btn" onClick={toggleMenu} id="userMenuBtn">
              {localUser ? `👤 ${localUser.name?.substring(0, 10)}` : '👤 Menu'}
            </button>
            <div className={`user-menu-content ${menuOpen ? 'show' : ''}`}>
              {!localUser ? (
                <>
                  <Link to="/user/login" onClick={() => setMenuOpen(false)}>
                    🔑 Login
                  </Link>
                  <Link to="/pin-recovery" onClick={() => setMenuOpen(false)}>
                    🔓 Forgot PIN?
                  </Link>
                </>
              ) : (
                <>
                  <Link to="#" onClick={handleLogout}>
                    🚪 Logout
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;