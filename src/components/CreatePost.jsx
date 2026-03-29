// src/components/CreatePost.jsx - COMPLETE WITH ALL INPUTS
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, userLogin, saveUserSession } from '../api/api';
import { countries } from '../utils/countries';

function CreatePost({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('Ad');
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [country, setCountry] = useState(currentUser?.country || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [mediaLink, setMediaLink] = useState('');
  
  // Subtitle fields - ALL MISSING INPUTS ADDED HERE
  const [subtitleText, setSubtitleText] = useState('');
  const [subtitleStart, setSubtitleStart] = useState(0);
  const [subtitleDuration, setSubtitleDuration] = useState(5);
  const [subtitleColor, setSubtitleColor] = useState('#ff006e');
  const [subtitleSize, setSubtitleSize] = useState(24);
  const [subtitlePosition, setSubtitlePosition] = useState('bottom');
  
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState(['', '', '', '', '', '']);
  
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = countries.find(c => c.name === country) || null;

  const handlePinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      if (value && index < 5) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleLoginPinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...loginPin];
      newPin[index] = value;
      setLoginPin(newPin);
      if (value && index < 5) {
        const nextInput = document.getElementById(`login-pin-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index, isLogin = false) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(isLogin ? `login-pin-${index - 1}` : `pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'File too large (max 30MB)' });
        return;
      }
      setMedia(file);
      setMediaLink('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaLinkChange = (e) => {
    const link = e.target.value;
    setMediaLink(link);
    if (link) {
      setMedia(null);
      setMediaPreview(link);
      const videoExtensions = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i;
      setMediaType(videoExtensions.test(link) ? 'video' : 'image');
    } else {
      setMediaPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      setStatus({ type: 'error', message: 'Please enter your display name' });
      return;
    }
    if (!country) {
      setStatus({ type: 'error', message: 'Please select your country' });
      return;
    }
    if (!phone.trim()) {
      setStatus({ type: 'error', message: 'WhatsApp number is required' });
      return;
    }
    if (!title.trim()) {
      setStatus({ type: 'error', message: 'Title is required' });
      return;
    }
    if (!description.trim()) {
      setStatus({ type: 'error', message: 'Description is required' });
      return;
    }
    
    const phoneNumber = phone.startsWith('+') ? phone : '+' + phone;
    const pinValue = pin.join('');
    
    if (!currentUser && pinValue.length !== 6) {
      setStatus({ type: 'error', message: 'PIN must be 6 digits for new users' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('user_name', userName);
      formData.append('country', country);
      formData.append('phone', phoneNumber);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', postType);
      formData.append('url', url);
      
      if (media) {
        formData.append('media', media);
      } else if (mediaLink) {
        formData.append('media_url', mediaLink);
      }
      
      // ALL SUBTITLE DATA BEING SENT
      if (subtitleText) {
        formData.append('subtitle_text', subtitleText);
        formData.append('subtitle_start', subtitleStart.toString());
        formData.append('subtitle_duration', subtitleDuration.toString());
        formData.append('subtitle_color', subtitleColor);
        formData.append('subtitle_size', subtitleSize.toString());
        formData.append('subtitle_position', subtitlePosition);
      }
      
      if (pinValue) {
        formData.append('pin', pinValue);
      }

      const result = await createPost(formData);
      
      if (result.ok) {
        if (!currentUser && pinValue) {
          try {
            const loginResult = await userLogin(phoneNumber, pinValue);
            if (loginResult.ok) {
              saveUserSession(loginResult.user, loginResult.token);
              if (setCurrentUser) setCurrentUser(loginResult.user);
            }
          } catch (err) {
            console.error('Auto-login failed:', err);
          }
        }
        
        setStatus({ type: 'success', message: 'Post created successfully! Redirecting...' });
        setTimeout(() => navigate('/'), 1500);
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to create post' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const phoneNumber = loginPhone.startsWith('+') ? loginPhone : '+' + loginPhone;
    const pinValue = loginPin.join('');
    
    if (!phoneNumber || pinValue.length !== 6) {
      setStatus({ type: 'error', message: 'Please enter valid phone and 6-digit PIN' });
      return;
    }
    
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const result = await userLogin(phoneNumber, pinValue);
      if (result.ok) {
        saveUserSession(result.user, result.token);
        if (setCurrentUser) setCurrentUser(result.user);
        setUserName(result.user.name);
        setCountry(result.user.country);
        setPhone(result.user.phone);
        setShowLoginForm(false);
        setStatus({ type: 'success', message: 'Logged in successfully!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: result.error || 'Login failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const previewSubtitleStyle = {
    textShadow: `0 0 10px ${subtitleColor}, 0 0 20px ${subtitleColor}, 0 0 30px ${subtitleColor}`,
    color: 'white',
    fontSize: `${subtitleSize}px`,
    textAlign: 'center',
    padding: '10px',
    animation: 'neonPulse 1.5s ease-in-out infinite alternate'
  };

  return (
    <main className="container">
      <div className="create-post-form">
        <h2 style={{ marginBottom: '30px', textAlign: 'center', background: 'linear-gradient(135deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ✨ Create New Post
        </h2>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.type === 'success' ? '✅ ' : '❌ '}{status.message}
          </div>
        )}

        {!currentUser && !showLoginForm && (
          <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(58, 134, 255, 0.1)', borderRadius: '16px', border: '1px solid var(--secondary)' }}>
            <p style={{ marginBottom: '10px' }}>Already have an account?</p>
            <button className="btn" onClick={() => setShowLoginForm(true)} style={{ background: 'rgba(58, 134, 255, 0.2)' }}>
              Login Here
            </button>
          </div>
        )}

        {showLoginForm && (
          <form onSubmit={handleLogin} style={{ marginBottom: '30px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px' }}>
            <h3 style={{ marginBottom: '15px' }}>Login to Your Account</h3>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input type="tel" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} placeholder="2507..." required />
            </div>
            <div className="form-group">
              <label>6-digit PIN</label>
              <div className="pin-input-container">
                {loginPin.map((digit, idx) => (
                  <input key={idx} id={`login-pin-${idx}`} type="tel" maxLength="1" className="pin-digit" value={digit} onChange={(e) => handleLoginPinChange(idx, e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx, true)} pattern="[0-9]" required />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn primary" disabled={loading}>{loading ? '⏳ Logging in...' : 'Login'}</button>
              <button type="button" className="btn" onClick={() => setShowLoginForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <form onSubmit={handleSubmit}>
          {/* POST TYPE SELECTOR */}
          <div className="form-group">
            <label>Post Type</label>
            <div className="topic-selector">
              <div className={`topic-option ${postType === 'Ad' ? 'selected' : ''}`} onClick={() => setPostType('Ad')}>📢 Ad</div>
              <div className={`topic-option ${postType === 'Topic' ? 'selected' : ''}`} onClick={() => setPostType('Topic')}>📌 Topic</div>
            </div>
          </div>

          {/* DISPLAY NAME */}
          <div className="form-group">
            <label>Display Name *</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your public name" required />
          </div>

          {/* COUNTRY SELECTOR WITH FLAG */}
          <div className="form-group">
            <label>Country *</label>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div onClick={() => setShowCountryDropdown(!showCountryDropdown)} style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid var(--border)', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedCountry?.flag && <img src={selectedCountry.flag} alt="" style={{ width: '24px', height: '18px' }} />}
                <span>{country || 'Select your country'}</span>
                <span style={{ marginLeft: 'auto' }}>▼</span>
              </div>
              {showCountryDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', maxHeight: '200px', overflowY: 'auto', zIndex: 10001, marginTop: '5px' }}>
                  <input type="text" placeholder="Search country..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px', margin: '10px', width: 'calc(100% - 20px)', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)' }} onClick={(e) => e.stopPropagation()} />
                  {filteredCountries.map((c) => (
                    <div key={c.code} onClick={() => { setCountry(c.name); setShowCountryDropdown(false); setSearchTerm(''); }} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,0,110,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <img src={c.flag} alt="" style={{ width: '24px', height: '18px' }} />
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* WHATSAPP NUMBER */}
          <div className="form-group">
            <label>WhatsApp Number (private) *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2507..." required />
          </div>

          {/* TITLE */}
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Catchy title" required />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Share your story..." rows="4" required />
          </div>

          {/* URL LINK */}
          <div className="form-group">
            <label>URL Link (optional)</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
          </div>

          {/* MEDIA UPLOAD */}
          <div className="form-group">
            <label>Upload Media (Image or Video, max 30MB)</label>
            <div className="media-upload" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleMediaChange} accept="image/*,video/*" style={{ display: 'none' }} />
              <label>{media ? <span>📁 {media.name}</span> : <><span>Click to upload</span><span style={{ fontSize: '12px' }}>JPG, PNG, GIF, MP4</span></>}</label>
            </div>
          </div>

          {/* MEDIA URL LINK - MISSING INPUT ADDED */}
          <div className="form-group">
            <label>Or Insert Media URL Link</label>
            <input type="url" value={mediaLink} onChange={handleMediaLinkChange} placeholder="https://example.com/image.jpg or video.mp4" />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Paste a direct link to an image or video file</div>
          </div>

          {/* MEDIA PREVIEW */}
          {mediaPreview && (
            <div className="form-group">
              <label>Media Preview</label>
              <div style={{ background: '#000', borderRadius: '16px', overflow: 'hidden', maxHeight: '200px' }}>
                {mediaType === 'video' ? (
                  <video controls style={{ width: '100%', maxHeight: '200px' }} src={mediaPreview} />
                ) : (
                  <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                )}
              </div>
            </div>
          )}

          {/* ========== SUBTITLE SECTION - ALL MISSING INPUTS ADDED HERE ========== */}
          <div className="form-group" style={{ border: `2px solid ${subtitleColor}`, borderRadius: '16px', padding: '16px', marginTop: '20px', background: 'rgba(0,0,0,0.3)' }}>
            <label style={{ color: subtitleColor, fontSize: '18px', fontWeight: 'bold', display: 'block', marginBottom: '15px' }}>
              🎬 VIDEO SUBTITLE SETTINGS (Neon Effect)
            </label>
            
            {/* Subtitle Text Input */}
            <div className="form-group">
              <label>Subtitle Text</label>
              <input 
                type="text" 
                value={subtitleText} 
                onChange={(e) => setSubtitleText(e.target.value)} 
                placeholder="Enter subtitle text that will appear on video"
                style={{ fontSize: '16px' }}
              />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                Leave empty for no subtitle
              </div>
            </div>

            {/* Start Time & Duration - Row 1 */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>⏱️ Start Time (seconds)</label>
                <input 
                  type="number" 
                  value={subtitleStart} 
                  onChange={(e) => setSubtitleStart(parseInt(e.target.value) || 0)} 
                  min="0" 
                  step="0.5"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>⏱️ Duration (seconds)</label>
                <input 
                  type="number" 
                  value={subtitleDuration} 
                  onChange={(e) => setSubtitleDuration(parseInt(e.target.value) || 5)} 
                  min="1" 
                  step="0.5"
                />
              </div>
            </div>

            {/* Color, Size, Position - Row 2 */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>🎨 Neon Color</label>
                <input 
                  type="color" 
                  value={subtitleColor} 
                  onChange={(e) => setSubtitleColor(e.target.value)} 
                  style={{ width: '100%', height: '40px', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>📏 Font Size: {subtitleSize}px</label>
                <input 
                  type="range" 
                  min="12" 
                  max="48" 
                  value={subtitleSize} 
                  onChange={(e) => setSubtitleSize(parseInt(e.target.value))} 
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>📍 Position</label>
                <select 
                  value={subtitlePosition} 
                  onChange={(e) => setSubtitlePosition(e.target.value)} 
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>

            {/* Live Preview of Subtitle with Neon Effect */}
            {subtitleText && (
              <div className="form-group" style={{ marginTop: '15px', padding: '15px', background: '#000', borderRadius: '12px', textAlign: 'center' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>🔮 Live Preview (Neon Effect)</label>
                <div style={previewSubtitleStyle}>
                  {subtitleText}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Appears at {subtitleStart}s for {subtitleDuration}s
                </div>
              </div>
            )}
          </div>

          {/* PIN INPUT FOR NEW USERS */}
          {!currentUser && (
            <div className="form-group">
              <label>Create 6-digit PIN (for new users)</label>
              <div className="pin-input-container">
                {pin.map((digit, idx) => (
                  <input key={idx} id={`pin-${idx}`} type="tel" maxLength="1" className="pin-digit" value={digit} onChange={(e) => handlePinChange(idx, e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx)} pattern="[0-9]" />
                ))}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '5px' }}>Leave blank if you already have an account</div>
            </div>
          )}

          <button type="submit" className="btn primary" style={{ width: '100%', padding: '15px', fontSize: '16px', marginTop: '20px' }} disabled={loading}>
            {loading ? '⏳ Creating...' : '✨ Create Post'}
          </button>
        </form>

        {!currentUser && !showLoginForm && (
          <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Need to recover your PIN?</p>
            <a href="/pin-recovery" className="btn" style={{ background: 'rgba(255,255,255,0.1)' }}>🔓 Forgot PIN?</a>
          </div>
        )}
      </div>

      {/* Add keyframes for neon pulse animation */}
      <style>{`
        @keyframes neonPulse {
          from {
            text-shadow: 0 0 5px ${subtitleColor}, 0 0 10px ${subtitleColor}, 0 0 15px ${subtitleColor};
          }
          to {
            text-shadow: 0 0 15px ${subtitleColor}, 0 0 25px ${subtitleColor}, 0 0 35px ${subtitleColor};
          }
        }
      `}</style>
    </main>
  );
}

export default CreatePost;