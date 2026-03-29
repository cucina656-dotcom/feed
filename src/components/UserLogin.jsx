// src/components/UserLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userLogin, saveUserSession } from '../api/api';

function UserLogin({ setCurrentUser }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const phoneNumber = phone.startsWith('+') ? phone : '+' + phone;
    const pinValue = pin.join('');
    
    if (!phoneNumber.trim()) {
      setError('Please enter your WhatsApp number');
      return;
    }
    if (pinValue.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await userLogin(phoneNumber, pinValue);
      
      if (result.ok) {
        saveUserSession(result.user, result.token);
        if (setCurrentUser) setCurrentUser(result.user);
        navigate('/create');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="create-post-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>🔑 Login</h2>
        
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>WhatsApp Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2507..."
              required
              disabled={loading}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
              Include country code (e.g., +2507...)
            </div>
          </div>
          
          <div className="form-group">
            <label>6-digit PIN</label>
            <div className="pin-input-container">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="tel"
                  maxLength="1"
                  className="pin-digit"
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  pattern="[0-9]"
                  required
                  disabled={loading}
                />
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            className="btn primary"
            style={{ width: '100%', padding: '15px', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/create" className="btn" style={{ marginRight: '10px' }}>
            Create Account
          </Link>
          <Link to="/pin-recovery" className="btn">
            Forgot PIN?
          </Link>
        </div>
      </div>
    </main>
  );
}

export default UserLogin;