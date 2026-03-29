// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import UserLogin from './components/UserLogin';
import PinRecovery from './components/PinRecovery';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { getUserSession } from './api/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const { user, token } = getUserSession();
    if (user && token) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Routes>
        <Route path="/" element={<Feed currentUser={currentUser} />} />
        <Route path="/create" element={<CreatePost currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
        <Route path="/post" element={<PostDetail currentUser={currentUser} />} />
        <Route path="/user/login" element={<UserLogin setCurrentUser={setCurrentUser} />} />
        <Route path="/pin-recovery" element={<PinRecovery />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;