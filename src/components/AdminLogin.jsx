// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, saveAdminSession } from '../api/api';

function AdminLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError('Please enter admin PIN');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await adminLogin(pin);
      
      if (result.success) {
        // The token is set via cookie from the server
        saveAdminSession('admin_session');
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Invalid admin PIN');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="create-post-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>🔐 Admin Login</h2>
        
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter admin PIN"
              required
              disabled={loading}
              maxLength="4"
            />
          </div>
          
          <button
            type="submit"
            className="btn primary"
            style={{ width: '100%', padding: '15px' }}
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/" className="btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;