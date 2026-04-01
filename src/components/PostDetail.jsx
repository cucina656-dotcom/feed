// src/components/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import CommentModal from './CommentModal';
import { getPosts, getComments, incrementViews, getViews, addCommentReply, hideComment, userLogin, saveUserSession } from '../api/api';
import { getTimeAgo } from '../utils/time';
import { getCountryByCode } from '../utils/countries';
import { getUserSession } from '../api/api';

const WORKER_URL = 'https://modekit.cucina656.workers.dev';

function PostDetail({ currentUser, setCurrentUser }) {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [replyToComment, setReplyToComment] = useState(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState(['', '', '', '', '', '']);
  const [loginError, setLoginError] = useState('');
  const [pendingReply, setPendingReply] = useState(null);

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

  const handleLoginPinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...loginPin];
      newPin[index] = value;
      setLoginPin(newPin);
      if (value && index < 5) {
        const nextInput = document.getElementById(`reply-login-pin-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`reply-login-pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleLoginSubmit = async () => {
    const phoneNumber = loginPhone.startsWith('+') ? loginPhone : '+' + loginPhone;
    const pinValue = loginPin.join('');
    
    if (!phoneNumber || pinValue.length !== 6) {
      setLoginError('Please enter valid phone and 6-digit PIN');
      return;
    }
    
    try {
      const result = await userLogin(phoneNumber, pinValue);
      if (result.ok) {
        saveUserSession(result.user, result.token);
        if (setCurrentUser) setCurrentUser(result.user);
        
        if (pendingReply) {
          setReplyToComment(pendingReply);
          setShowCommentModal(true);
          setPendingReply(null);
        }
        
        setShowLoginModal(false);
        setLoginPhone('');
        setLoginPin(['', '', '', '', '', '']);
        setLoginError('');
      } else {
        setLoginError(result.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleReply = (comment) => {
    const session = getUserSession();
    if (!session.user) {
      setPendingReply(comment);
      setShowLoginModal(true);
      return;
    }
    setReplyToComment(comment);
    setShowCommentModal(true);
  };

  const handleReplySubmit = async (commentData) => {
    const session = getUserSession();
    if (!session.user) {
      setShowLoginModal(true);
      return false;
    }
    
    const replyData = {
      parent_id: replyToComment.id,
      user_name: commentData.user_name,
      user_age: commentData.user_age,
      user_country: commentData.user_country,
      profile_picture: commentData.profile_picture,
      comment: commentData.comment,
      media_url: commentData.media_url,
      score: commentData.score
    };
    
    try {
      await addCommentReply(replyData);
      setReplyToComment(null);
      await handleCommentAdded();
      return true;
    } catch (err) {
      console.error('Reply error:', err);
      alert('Failed to post reply');
      return false;
    }
  };

  const handleHideComment = async (commentId) => {
    const session = getUserSession();
    if (!session.user) {
      setShowLoginModal(true);
      return;
    }
    try {
      await hideComment(commentId);
      handleCommentAdded();
    } catch (err) {
      console.error('Hide error:', err);
    }
  };

  // Parse mentions from text
  const parseMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'mention', content: match[0], username: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts;
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

  // Build comment tree
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

  // Comment Component
  const CommentComponent = ({ comment, depth = 0 }) => {
    const commentCountryData = getCountryByCode(comment.user_country) || { flag: null };
    const commentAge = comment.user_age ? new Date().getFullYear() - comment.user_age : null;
    const parsedComment = parseMentions(comment.comment);
    
    const getScoreColor = (score) => {
      if (score >= 50) return '#00ff88';
      return '#ff4444';
    };

    return (
      <div style={{ marginLeft: depth > 0 ? '44px' : '0', marginBottom: '12px' }}>
        <div className={`comment-card ${depth > 0 ? 'reply' : ''}`}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="comment-avatar">
              {comment.profile_picture ? (
                <img src={comment.profile_picture} alt="" />
              ) : (
                <span>{comment.user_name?.charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <span className="comment-name">{comment.user_name}</span>
                {commentCountryData.flag && <img src={commentCountryData.flag} alt="" className="comment-flag" />}
                {commentAge && <span className="comment-age">({commentAge} yrs)</span>}
                <span className="comment-time">{getTimeAgo(comment.created_at)}</span>
              </div>
              
              {/* Score Display - Replaces rating stars */}
              {comment.score !== undefined && comment.score !== null && (
                <div style={{ marginTop: '4px', marginBottom: '6px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: getScoreColor(comment.score),
                    background: 'rgba(0,0,0,0.3)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'inline-block'
                  }}>
                    Score: {comment.score}/100
                  </span>
                </div>
              )}
              
              {/* Comment with mentions */}
              <div className="comment-text">
                {parsedComment.map((part, idx) => {
                  if (part.type === 'mention') {
                    return (
                      <span 
                        key={idx} 
                        className="mention"
                        style={{
                          color: '#3a86ff',
                          fontWeight: 'bold',
                          textShadow: '0 0 5px rgba(58,134,255,0.5)',
                          cursor: 'pointer'
                        }}
                      >
                        👉 {part.content}
                      </span>
                    );
                  }
                  return <span key={idx}>{part.content}</span>;
                })}
              </div>
              
              {comment.media_url && (
                <a href={comment.media_url} target="_blank" rel="noopener noreferrer" className="comment-media-link">
                  🔗 Media Link
                </a>
              )}
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <button onClick={() => handleReply(comment)} className="comment-reply-btn">
                  💬 Reply
                </button>
                <button onClick={() => handleHideComment(comment.id)} className="comment-reply-btn">
                  ✕ Hide
                </button>
              </div>
            </div>
          </div>
        </div>
        {comment.replies && comment.replies.map(reply => (
          <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      
      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'var(--card-gradient)', borderRadius: '24px', padding: '30px', maxWidth: '400px', width: '90%', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>🔑 Login Required</h3>
            <p style={{ marginBottom: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Please login to reply or interact with comments</p>
            
            {loginError && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>❌ {loginError}</div>}
            
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input type="tel" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} placeholder="2507..." />
            </div>
            
            <div className="form-group">
              <label>6-digit PIN</label>
              <div className="pin-input-container">
                {loginPin.map((digit, idx) => (
                  <input key={idx} id={`reply-login-pin-${idx}`} type="tel" maxLength="1" className="pin-digit" value={digit} onChange={(e) => handleLoginPinChange(idx, e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx)} pattern="[0-9]" />
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn primary" style={{ flex: 1 }} onClick={handleLoginSubmit}>Login</button>
              <button className="btn" style={{ flex: 1 }} onClick={() => {
                setShowLoginModal(false);
                setPendingReply(null);
              }}>Cancel</button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <Link to="/create" style={{ color: 'var(--secondary)', fontSize: '12px' }}>Don't have an account? Create one</Link>
            </div>
          </div>
        </div>
      )}
      
      {/* FIXED MEDIA SECTION WITH CLOSE ICON */}
      <div style={{ background: '#000', width: '100%', maxHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {mediaUrl && (
          isVideo ? (
            <VideoPlayer src={mediaUrl} subtitle={subtitleData} />
          ) : (
            <img src={mediaUrl} alt={post.title} style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain' }} />
          )
        )}
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
            <div className="user-avatar">
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

        {/* Interaction Bar */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px' }}>👁️ {views}</span>
              <span style={{ fontSize: '14px' }}>💬 {commentCount}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <button className="action-btn" onClick={() => {
              setReplyToComment(null);
              setShowCommentModal(true);
            }}>👍 Like</button>
            <button className="action-btn" onClick={() => {
              setReplyToComment(null);
              setShowCommentModal(true);
            }}>💬 Comment</button>
            <button className="action-btn">📤 Share</button>
          </div>
        </div>

        {/* Comment List */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-muted)' }}>Most relevant ⌵</p>
          {topComments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No comments yet. Be the first to comment!</p>
          ) : (
            topComments.map(comment => <CommentComponent key={comment.id} comment={comment} depth={0} />)
          )}
        </div>
      </div>

      {/* FIXED INPUT BAR */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', padding: '8px 16px' }}>
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <input 
            type="text" 
            placeholder={`Comment as ${currentUser?.name || 'Guest'}... (Use @username to mention)`} 
            onClick={() => {
              const session = getUserSession();
              if (!session.user) {
                setShowLoginModal(true);
              } else {
                setReplyToComment(null);
                setShowCommentModal(true);
              }
            }}
            readOnly
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '14px' }}
          />
          <div style={{ display: 'flex', gap: '12px', fontSize: '20px' }}>
            <span>📷</span>
            <span>😊</span>
          </div>
        </div>
      </div>

      {showCommentModal && (
        <CommentModal
          post={post}
          currentUser={currentUser}
          isReply={!!replyToComment}
          parentComment={replyToComment}
          onClose={() => {
            setShowCommentModal(false);
            setReplyToComment(null);
          }}
          onSuccess={async (commentData) => {
            if (replyToComment) {
              await handleReplySubmit(commentData);
            }
            setShowCommentModal(false);
            setReplyToComment(null);
            await handleCommentAdded();
          }}
        />
      )}
    </div>
  );
}

export default PostDetail;
