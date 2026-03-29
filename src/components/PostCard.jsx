// src/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import { getTimeAgo } from '../utils/time';
import { getCountryByCode } from '../utils/countries';
import { getViews } from '../api/api';

function PostCard({ post, currentUser, onView, onComment }) {
  const [views, setViews] = useState(post.view_count || Math.floor(Math.random() * 200) + 50);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    // Fetch real view count if available
    const fetchViews = async () => {
      try {
        const data = await getViews(post.id);
        if (data && data.views) {
          setViews(data.views);
        }
      } catch (err) {
        // Use default or existing view count
        console.error('Error fetching views:', err);
      }
    };
    fetchViews();
  }, [post.id]);

  const timeAgo = getTimeAgo(post.created_at);
  const posterName = post.poster_name || post.user_name || 'Anonymous';
  const posterCountry = post.poster_country || post.country || 'Unknown';
  const commentCount = post.comments || 0;
  const ratingCount = post.ratings || 0;
  const avgRating = post.avg_rating || 0;

  // Get country flag
  const countryData = getCountryByCode(posterCountry) || { flag: null, name: posterCountry };
  
  // Generate stars display
  const fullStars = Math.floor(avgRating);
  const starsDisplay = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

  // Determine if media is video
  const isVideo = post.image_url && 
    post.image_url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/);

  const handleViewPost = () => {
    if (onView) {
      onView(post);
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const description = post.description || '';
  const shouldTruncate = description.length > 150;
  const displayDescription = shouldTruncate && !showFullDescription
    ? description.substring(0, 150) + '...'
    : description;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user">
          <div className="user-avatar">
            {posterName.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">
              {posterName}
              {countryData.flag && (
                <img 
                  src={countryData.flag} 
                  alt={posterCountry}
                  className="user-flag"
                  style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="user-country">
              📍 {posterCountry}
            </div>
          </div>
        </div>
        <span className="post-type-badge">
          {post.type === 'Ad' ? '📢 Ad' : '📌 Topic'}
        </span>
      </div>

      {/* Media Section */}
      {post.image_url && (
        <div className="post-media">
          {isVideo ? (
            <VideoPlayer 
              src={post.image_url} 
              subtitle={post.subtitle}
              onPlay={handleViewPost}
            />
          ) : (
            <img 
              src={post.image_url} 
              alt={post.title} 
              loading="lazy"
              onClick={handleViewPost}
            />
          )}
        </div>
      )}

      <div className="post-info">
        <div className="post-stats">
          <span className="view-icon"> {views}</span>
          <span className="comment-icon"> {commentCount}</span>
          <span className="rating-icon"> {avgRating.toFixed(1)} ({ratingCount})</span>
        </div>

        <div className="post-title">
          {post.title}
          <span>{timeAgo}</span>
        </div>

        <div className="post-description">
          {displayDescription}
          {shouldTruncate && (
            <button 
              onClick={toggleDescription}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                marginLeft: '5px',
                fontSize: '12px'
              }}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {post.url && (
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tap-in-btn"
          >
            Tap in
          </a>
        )}
      </div>

      <div className="post-actions">
        <button 
          className="action-btn"
          onClick={() => onComment && onComment(post)}
        >
          <span>💬</span> Comment & Rate
        </button>
        <Link 
          to={`/post?id=${encodeURIComponent(post.id)}`} 
          className="action-btn"
          onClick={handleViewPost}
        >
          <span>📄</span> View Details
        </Link>
      </div>
    </div>
  );
}

export default PostCard;