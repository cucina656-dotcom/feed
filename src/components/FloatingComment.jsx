// src/components/FloatingComment.jsx
import React, { useState, useEffect } from 'react';
import { getCountryByCode } from '../utils/countries';
import { getTimeAgo } from '../utils/time';

function FloatingComment({ comment, onReply, onHide, isLatest }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isHidden, setIsHidden] = useState(comment.is_hidden || false);
  
  const countryData = getCountryByCode(comment.user_country) || { flag: null };
  const timeAgo = getTimeAgo(comment.created_at);
  const commentAge = comment.user_age ? new Date().getFullYear() - comment.user_age : null;

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleHide = () => {
    setIsHidden(true);
    onHide(comment.id);
  };

  if (isHidden) return null;

  return (
    <div className={`floating-comment ${isLatest ? 'latest-comment' : ''}`} style={{
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      marginBottom: '10px',
      padding: '12px',
      border: isLatest ? '2px solid var(--accent)' : '1px solid var(--border)',
      animation: isLatest ? 'glowPulse 2s infinite' : 'none'
    }}>
      <div className="comment-header" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
        <div className="comment-avatar" style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {comment.profile_picture ? (
            <img src={comment.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{comment.user_name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{comment.user_name}</span>
            {countryData.flag && (
              <img src={countryData.flag} alt="" style={{ width: '20px', height: '15px', borderRadius: '2px' }} />
            )}
            {commentAge && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({commentAge} yrs)</span>}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo}</span>
          </div>
          <div className="comment-rating" style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
            {[1,2,3,4,5].map(star => (
              <span key={star} style={{ fontSize: '12px', color: star <= comment.rating ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }}>★</span>
            ))}
          </div>
        </div>
        <button onClick={handleHide} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
      </div>
      
      <div className="comment-text" style={{ color: 'var(--text)', marginBottom: '8px', paddingLeft: '50px' }}>
        {comment.comment}
      </div>
      
      {comment.media_url && (
        <a href={comment.media_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', fontSize: '12px', paddingLeft: '50px', display: 'inline-block' }}>
          🔗 Media Link
        </a>
      )}
      
      <div className="comment-actions" style={{ display: 'flex', gap: '15px', paddingLeft: '50px', marginTop: '8px' }}>
        <button onClick={() => setShowReplyInput(!showReplyInput)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>
          💬 Reply
        </button>
        {comment.reply_count > 0 && (
          <button onClick={() => setShowReplies(!showReplies)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>
            {showReplies ? '▲ Hide' : `▼ ${comment.reply_count} replies`}
          </button>
        )}
      </div>
      
      {showReplyInput && (
        <div style={{ marginTop: '10px', paddingLeft: '50px' }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows="2"
            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={handleReply} className="btn primary" style={{ padding: '5px 15px', fontSize: '12px' }}>Post Reply</button>
            <button onClick={() => setShowReplyInput(false)} className="btn" style={{ padding: '5px 15px', fontSize: '12px' }}>Cancel</button>
          </div>
        </div>
      )}
      
      {showReplies && comment.replies && comment.replies.map(reply => (
        <FloatingComment key={reply.id} comment={reply} onReply={onReply} onHide={onHide} isLatest={false} />
      ))}
    </div>
  );
}

export default FloatingComment;