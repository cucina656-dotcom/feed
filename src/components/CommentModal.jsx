// src/components/CommentModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { addCommentWithRating } from '../api/api';
import { countries, getCountryByCode } from '../utils/countries';

function CommentModal({ post, currentUser, onClose, onSuccess }) {
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userAge, setUserAge] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    // Validation
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!userAge) {
      setError('Please enter your year of birth');
      return;
    }
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(userAge);
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
      setError('Please enter a valid year of birth');
      return;
    }
    if (!selectedCountry) {
      setError('Please select your country');
      return;
    }
    if (rating === 0) {
      setError('Please rate this post (1-5 stars)');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert profile picture to base64 if provided
      let profilePictureBase64 = '';
      if (profilePicture) {
        const reader = new FileReader();
        profilePictureBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(profilePicture);
        });
      }

      const commentData = {
        post_id: post.id,
        user_name: userName.trim(),
        user_age: birthYear,
        user_country: selectedCountry,
        profile_picture: profilePictureBase64,
        rating: rating,
        comment: comment.trim(),
        media_url: mediaUrl.trim() || null,
      };

      const result = await addCommentWithRating(commentData);
      
      if (result.ok) {
        setSuccess('Comment and rating submitted successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to submit');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Calculate age from birth year
  const calculateAge = (birthYear) => {
    if (!birthYear) return '';
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthYear);
  };

  const selectedCountryData = getCountryByCode(selectedCountry);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--card-gradient)',
          borderRadius: '24px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>
          Rate & Comment on "{post.title}"
        </h3>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '15px' }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '15px' }}>
            ✅ {success}
          </div>
        )}

        {/* User Info Section */}
        <div className="form-group">
          <label>Your Name *</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your display name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Year of Birth *</label>
          <input
            type="number"
            value={userAge}
            onChange={(e) => setUserAge(e.target.value)}
            placeholder="e.g., 1990"
            min="1900"
            max={new Date().getFullYear()}
            disabled={loading}
          />
          {userAge && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
              Age: {calculateAge(userAge)} years
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Country *</label>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={() => !loading && setShowCountryDropdown(!showCountryDropdown)}
              style={{
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {selectedCountryData?.flag && (
                <img src={selectedCountryData.flag} alt="" style={{ width: '24px', height: '18px' }} />
              )}
              <span>{selectedCountryData?.name || 'Select your country'}</span>
              <span style={{ marginLeft: 'auto' }}>▼</span>
            </div>
            {showCountryDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10001,
                  marginTop: '5px',
                }}
              >
                <input
                  type="text"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '10px',
                    margin: '10px',
                    width: 'calc(100% - 20px)',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country.code);
                      setShowCountryDropdown(false);
                      setSearchTerm('');
                    }}
                    style={{
                      padding: '10px 15px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.3s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,0,110,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={country.flag} alt="" style={{ width: '24px', height: '18px' }} />
                    <span>{country.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Profile Picture (optional)</label>
          <div
            className="media-upload"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '20px' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/*"
              disabled={loading}
              style={{ display: 'none' }}
            />
            {profilePicturePreview ? (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={profilePicturePreview}
                  alt="Preview"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '10px',
                  }}
                />
                <div>Click to change</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                <div>Upload profile picture</div>
              </div>
            )}
          </div>
        </div>

        {/* Rating Section */}
        <div className="form-group">
          <label>Your Rating *</label>
          <div className="rating-stars" style={{ justifyContent: 'center', margin: '15px 0' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${rating >= star ? 'selected' : ''}`}
                onClick={() => !loading && handleRatingClick(star)}
                style={{ cursor: loading ? 'not-allowed' : 'pointer', fontSize: '32px' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className="form-group">
          <label>Your Comment *</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your thoughts about this post..."
            rows="4"
            disabled={loading}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-group">
          <label>Media URL (optional)</label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg or video link"
            disabled={loading}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
            Share a link to an image or video related to your comment
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            className="btn primary"
            style={{ flex: 2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '⭐ Submit Rating & Comment'}
          </button>
          <button
            className="btn"
            style={{ flex: 1 }}
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;