// src/components/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import CommentModal from './CommentModal';
import { getPosts, getComments, getRatings, incrementViews, getViews } from '../api/api';
import { getTimeAgo, formatDate } from '../utils/time';
import { getCountryByCode } from '../utils/countries';

function PostDetail({ currentUser }) {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    if (!postId) {
      setError('Missing post ID');
      setLoading(false);
      return;
    }

    const loadPostData = async () => {
      try {
        setLoading(true);
        
        // Get all posts and find the specific one
        const posts = await getPosts();
        const foundPost = posts.find(p => p.id === postId);
        
        if (!foundPost) {
          setError('Post not found');
          return;
        }
        
        setPost(foundPost);
        
        // Increment view count
        await incrementViews(postId);
        
        // Get view count
        const viewsData = await getViews(postId);
        if (viewsData && viewsData.views) {
          setViews(viewsData.views);
        } else {
          setViews(foundPost.view_count || Math.floor(Math.random() * 200) + 50);
        }
        
        // Get comments
        const commentsData = await getComments(postId);
        setComments(commentsData.comments || []);
        
        // Get ratings
        const ratingsData = await getRatings(postId);
        setRatings(ratingsData.ratings || []);
        
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    loadPostData();
  }, [postId]);

  const handleCommentAdded = () => {
    // Refresh comments
    const loadComments = async () => {
      const commentsData = await getComments(postId);
      setComments(commentsData.comments || []);
    };
    loadComments();
  };

  if (loading) {
    return (
      <main className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>Loading post...</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😢</div>
          <h3 style={{ marginBottom: '20px' }}>{error || 'Post not found'}</h3>
          <Link to="/" className="btn primary">Back to Feed</Link>
        </div>
      </main>
    );
  }

  const posterName = post.poster_name || post.user_name || 'Anonymous';
  const posterCountry = post.poster_country || post.country || 'Unknown';
  const timeAgo = getTimeAgo(post.created_at);
  const commentCount = comments.length;
  const ratingCount = ratings.length;
  const avgRating = post.avg_rating || 0;
  
  const countryData = getCountryByCode(posterCountry) || { flag: null, name: posterCountry };
  
  const fullStars = Math.floor(avgRating);
  const starsDisplay = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
  
  const isVideo = post.image_url && 
    post.image_url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/);

  return (
    <main className="container">
      <div className="post-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
              />
            ) : (
              <img src={post.image_url} alt={post.title} />
            )}
          </div>
        )}

        <div className="post-info">
          <div className="post-stats">
            <span className="view-icon"> {views}</span>
            <span className="comment-icon"> {commentCount}</span>
            <span className="rating-icon"> {avgRating.toFixed(1)} ({ratingCount})</span>
          </div>

          <h3 className="post-title">{post.title}</h3>
          <div className="post-description">{post.description}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Posted {timeAgo}
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

        {/* Comments Section */}
        <div className="reviews-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4>Comments ({commentCount})</h4>
            <button 
              className="btn primary" 
              onClick={() => setShowCommentModal(true)}
              style={{ padding: '8px 16px' }}
            >
              💬 Add Comment & Rating
            </button>
          </div>

          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              No comments yet. Be the first to comment and rate!
            </p>
          ) : (
            comments.map((comment) => {
              const commentCountryData = getCountryByCode(comment.user_country) || { flag: null };
              const commentAge = comment.user_age ? new Date().getFullYear() - comment.user_age : null;
              
              return (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-avatar">
                      {comment.profile_picture ? (
                        <img src={comment.profile_picture} alt={comment.user_name} />
                      ) : (
                        comment.user_name?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div className="comment-info">
                      <div className="comment-name">
                        {comment.user_name}
                        {commentCountryData.flag && (
                          <img 
                            src={commentCountryData.flag} 
                            alt={comment.user_country}
                            className="comment-flag"
                          />
                        )}
                        {commentAge && (
                          <span className="comment-age">({commentAge} years)</span>
                        )}
                      </div>
                      <div className="comment-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            className={`comment-star ${star <= comment.rating ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="comment-text">{comment.comment}</div>
                  {comment.media_url && (
                    <a 
                      href={comment.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="comment-media-link"
                    >
                      🔗 {comment.media_url.length > 50 ? comment.media_url.substring(0, 50) + '...' : comment.media_url}
                    </a>
                  )}
                  <div className="comment-time">
                    {formatDate(comment.created_at)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ratings Summary Section */}
        <div className="rating-section">
          <h4 style={{ marginBottom: '16px' }}>Ratings Summary</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--accent)' }}>
                {avgRating.toFixed(1)}
              </div>
              <div className="rating-stars" style={{ justifyContent: 'center', margin: '5px 0' }}>
                {starsDisplay}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Based on {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter(r => r.rating === star).length;
                const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ minWidth: '40px' }}>{star} ★</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--secondary))' }} />
                    </div>
                    <span style={{ minWidth: '40px', fontSize: '12px' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showCommentModal && (
        <CommentModal
          post={post}
          currentUser={currentUser}
          onClose={() => setShowCommentModal(false)}
          onSuccess={handleCommentAdded}
        />
      )}
    </main>
  );
}

export default PostDetail;