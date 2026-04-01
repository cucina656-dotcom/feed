// src/components/CommentModal.jsx - With Score Input for Replies
import React, { useState, useRef, useEffect } from 'react';
import { addCommentWithRating, addCommentReply } from '../api/api';
import { countries, getCountryByCode } from '../utils/countries';

function CommentModal({ post, currentUser, isReply = false, parentComment = null, onClose, onSuccess }) {
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userAge, setUserAge] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [rating, setRating] = useState(0);
  const [score, setScore] = useState(50); // NEW: Score for replies (0-100)
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
    
    // Validate score for replies
    if (isReply && (score < 0 || score > 100)) {
      setError('Please enter a valid score (0-100)');
      return;
    }
    
    // Only require rating for new comments, not for replies
    if (!isReply && rating === 0) {
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

      let result;
      
      if (isReply && parentComment) {
        // This is a reply - use addCommentReply API with SCORE
        const replyData = {
          parent_id: parentComment.id,
          user_name: userName.trim(),
          user_age: birthYear,
          user_country: selectedCountry,
          profile_picture: profilePictureBase64,
          comment: comment.trim(),
          media_url: mediaUrl.trim() || null,
          score: score  // NEW: Include score for replies
        };
        result = await addCommentReply(replyData);
      } else {
        // This is a new comment - use addCommentWithRating API
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
        result = await addCommentWithRating(commentData);
      }
      
      if (result.ok) {
        setSuccess(isReply ? 'Reply submitted successfully!' : 'Comment and rating submitted successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(comment);
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
  
  // Get color for score display
  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 50) return '#00ff88';
    return '#ff4444';
  };

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
          {isReply 
            ? `Reply to ${parentComment?.user_name || 'comment'}`
            : `Rate & Comment on "${post.title}"`
          }
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

        {/* Rating Section - For new comments (stars) */}
        {!isReply && (
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
        )}

        {/* Score Section - For replies (0-100 slider) */}
        {isReply && (
          <div className="form-group">
            <label>Score (0-100) *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={score} 
                onChange={(e) => setScore(parseInt(e.target.value))}
                style={{ flex: 1, height: '8px', borderRadius: '4px', cursor: 'pointer' }}
                disabled={loading}
              />
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: getScoreColor(score),
                minWidth: '60px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.3)',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {score}/100
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Score appears with: <span style={{ color: '#00ff88' }}>Green (≥50)</span> or <span style={{ color: '#ff4444' }}>Red (&lt;50)</span>
            </div>
          </div>
        )}

        {/* Comment Section */}
        <div className="form-group">
          <label>Your {isReply ? 'Reply' : 'Comment'} *</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isReply ? "Write your reply... (Use @username to mention someone)" : "Write your thoughts about this post... (Use @username to mention someone)"}
            rows="4"
            disabled={loading}
            style={{ resize: 'vertical' }}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
            💡 Type @ followed by username to mention someone (e.g., @John)
          </div>
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
            Share a link to an image or video related to your {isReply ? 'reply' : 'comment'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            className="btn primary"
            style={{ flex: 2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : (isReply ? '💬 Post Reply' : '⭐ Submit Rating & Comment')}
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
