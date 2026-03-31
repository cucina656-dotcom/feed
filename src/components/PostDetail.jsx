// src/components/PostDetail.jsx - Combined (Close Icon + Facebook Style Comments)
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import CommentModal from './CommentModal';
import { getPosts, getComments, getRatings, incrementViews, getViews, addCommentReply, hideComment } from '../api/api';
import { getTimeAgo } from '../utils/time';
import { getCountryByCode } from '../utils/countries';
import { getUserSession } from '../api/api';

const WORKER_URL = 'https://modekit.cucina656.workers.dev';

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
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!postId) {
      setError('Missing post ID');
      setLoading(false);
      return;
    }

    const loadPostData = async () => {
      try {
        setLoading(true);
        const posts = await getPosts();
        const foundPost = posts.find(p => p.id === postId);
        if (!foundPost) {
          setError('Post not found');
          return;
        }
        setPost(foundPost);
        await incrementViews(postId);
        const viewsData = await getViews(postId);
        setViews(viewsData?.views || foundPost.view_count || 0);
        const commentsData = await getComments(postId);
        setComments(commentsData.comments || []);
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

  const handleCommentAdded = async () => {
    const commentsData = await getComments(postId);
    setComments(commentsData.comments || []);
  };

  const handleReply = async (parentId, text) => {
    const user = getUserSession().user;
    if (!user) {
      alert('Please login to reply');
      return;
    }
    
    const replyData = {
      parent_id: parentId,
      user_name: user.name,
      user_age: user.birth_year,
      user_country: user.country,
      profile_picture: user.profile_picture,
      comment: text,
      media_url: null
    };
    
    try {
      await addCommentReply(replyData);
      setReplyTo(null);
      setReplyText('');
      handleCommentAdded();
    } catch (err) {
      console.error('Reply error:', err);
      alert('Failed to post reply');
    }
  };

  const handleHideComment = async (commentId) => {
    try {
      await hideComment(commentId);
      handleCommentAdded();
    } catch (err) {
      console.error('Hide error:', err);
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="loading"><div className="loading-spinner"></div></div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h3>{error || 'Post not found'}</h3>
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
  const countryData = getCountryByCode(posterCountry) || { flag: null };
  const mediaUrl = post.image_url ? `${WORKER_URL}${post.image_url}` : null;
  const isVideo = mediaUrl && mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/);

  const subtitleData = {
    text: post.subtitle_text || '',
    start: post.subtitle_start || 0,
    duration: post.subtitle_duration || 5,
    color: post.subtitle_color || '#ff006e',
    size: post.subtitle_size || 24,
    position: post.subtitle_position || 'bottom'
  };

  // Build comment tree (parent-child relationship)
  const commentMap = new Map();
  const topComments = [];
  
  comments.forEach(comment => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });
  
  comments.forEach(comment => {
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id).replies.push(comment);
    } else if (!comment.parent_id) {
      topComments.push(comment);
    }
  });

  // Recursive Comment Component
  const CommentComponent = ({ comment, depth = 0 }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [localReplyText, setLocalReplyText] = useState('');
    const commentCountryData = getCountryByCode(comment.user_country) || { flag: null };
    const commentAge = comment.user_age ? new Date().getFullYear() - comment.user_age : null;
    
    const submitReply = async () => {
      if (localReplyText.trim()) {
        await handleReply(comment.id, localReplyText);
        setLocalReplyText('');
        setShowReplyInput(false);
      }
    };

    return (
      <div style={{ marginLeft: depth > 0 ? '44px' : '0', marginBottom: '12px' }}>
        <div className="comment-card" style={{ background: '#1a1a1a', borderRadius: '20px', padding: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="comment-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {comment.profile_picture ? (
                <img src={comment.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{comment.user_name?.charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{comment.user_name}</span>
                {commentCountryData.flag && <img src={commentCountryData.flag} alt="" style={{ width: '16px', height: '12px' }} />}
                {commentAge && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({commentAge} yrs)</span>}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{getTimeAgo(comment.created_at)}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ fontSize: '11px', color: star <= comment.rating ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }}>★</span>
                ))}
              </div>
              <div style={{ fontSize: '14px', marginTop: '6px', lineHeight: '1.4' }}>{comment.comment}</div>
              {comment.media_url && (
                <a href={comment.media_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--secondary)', display: 'inline-block', marginTop: '6px' }}>🔗 Media Link</a>
              )}
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px' }}>
                <button onClick={() => setShowReplyInput(!showReplyInput)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Reply</button>
                <button onClick={() => handleHideComment(comment.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Hide</button>
              </div>
              {showReplyInput && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <textarea 
                    value={localReplyText} 
                    onChange={(e) => setLocalReplyText(e.target.value)} 
                    placeholder="Write a reply..." 
                    rows="2" 
                    style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text)', fontSize: '13px', resize: 'vertical' }} 
                  />
                  <button onClick={submitReply} className="btn primary" style={{ padding: '8px 16px', fontSize: '12px' }}>Post</button>
                  <button onClick={() => setShowReplyInput(false)} className="btn" style={{ padding: '8px 16px', fontSize: '12px' }}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Render replies directly below - visible, not hidden */}
        {comment.replies && comment.replies.map(reply => (
          <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      
      {/* FIXED MEDIA SECTION WITH CLOSE ICON */}
      <div style={{ background: '#000', width: '100%', maxHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {mediaUrl && (
          isVideo ? (
            <VideoPlayer src={mediaUrl} subtitle={subtitleData} />
          ) : (
            <img src={mediaUrl} alt={post.title} style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain' }} />
          )
        )}
        {/* CLOSE ICON - Fixed */}
        <Link 
          to="/" 
          className="btn" 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.7)', 
            padding: '8px 12px', 
            fontSize: '18px', 
            zIndex: 10,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </Link>
      </div>

      {/* SCROLLABLE INTERACTION & COMMENTS SECTION */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        
        {/* Post Info */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div className="user-avatar" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent), var(--secondary))', borderRadius: '50%' }}>
              {posterName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 'bold' }}>{posterName}</span>
                {countryData.flag && <img src={countryData.flag} alt="" style={{ width: '20px', height: '15px' }} />}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeAgo}</span>
            </div>
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{post.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>{post.description}</p>
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="tap-in-btn" style={{ marginTop: '12px', display: 'inline-block' }}>
              Tap in
            </a>
          )}
        </div>

        {/* Interaction Bar (Facebook Style) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px' }}>⭐ {avgRating.toFixed(1)}</span>
              <span style={{ fontSize: '14px' }}>👁️ {views}</span>
              <span style={{ fontSize: '14px' }}>💬 {commentCount}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <button className="action-btn" onClick={() => setShowCommentModal(true)} style={{ flex: 1, padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>👍 Like</button>
            <button className="action-btn" onClick={() => setShowCommentModal(true)} style={{ flex: 1, padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>💬 Comment</button>
            <button className="action-btn" style={{ flex: 1, padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>📤 Share</button>
          </div>
        </div>

        {/* Comment List - Facebook Style with Visible Replies */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-muted)' }}>Most relevant ⌵</p>
          {topComments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No comments yet. Be the first to comment!</p>
          ) : (
            topComments.map(comment => <CommentComponent key={comment.id} comment={comment} depth={0} />)
          )}
        </div>
      </div>

      {/* FIXED INPUT BAR (Facebook Style) */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', padding: '8px 16px' }}>
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent), var(--secondary))', borderRadius: '50%' }}>
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <input 
            type="text" 
            placeholder={`Comment as ${currentUser?.name || 'Guest'}...`} 
            onClick={() => setShowCommentModal(true)}
            readOnly
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '14px' }}
          />
          <div style={{ display: 'flex', gap: '12px', fontSize: '20px' }}>
            <span style={{ cursor: 'pointer' }}>📷</span>
            <span style={{ cursor: 'pointer' }}>😊</span>
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
    </div>
  );
}

export default PostDetail;
