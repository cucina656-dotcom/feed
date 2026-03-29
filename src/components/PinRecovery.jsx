// src/components/PinRecovery.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { pinRecovery } from '../api/api';

function PinRecovery() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const phoneNumber = phone.startsWith('+') ? phone : '+' + phone;
    
    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      setMessage({ type: 'error', text: 'Please enter a valid WhatsApp number' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await pinRecovery(phoneNumber);
      
      if (result.ok) {
        setMessage({ 
          type: 'success', 
          text: '✅ Recovery request submitted! Admin will contact you via WhatsApp with a new PIN.' 
        });
        setPhone('');
      } else {
        setMessage({ type: 'error', text: '❌ ' + (result.error || 'Recovery request failed') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ ' + (err.message || 'An error occurred') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="create-post-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>🔓 Forgot PIN</h2>
        
        {message.text && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your WhatsApp Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2507..."
              required
              disabled={loading}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
              Enter the WhatsApp number associated with your account
            </div>
          </div>
          
          <button
            type="submit"
            className="btn primary"
            style={{ width: '100%', padding: '15px' }}
            disabled={loading}
          >
            {loading ? '⏳ Processing...' : 'Submit Request'}
          </button>
        </form>
        
        <div className="alert alert-info" style={{ marginTop: '30px' }}>
          <strong>Note:</strong> Admin will contact you via WhatsApp with a new PIN within 24 hours.
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/user/login" className="btn">
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default PinRecovery;