// Update CommentModal.jsx - Add score state
const [score, setScore] = useState(0);

// Add this in the JSX for replies (replace the rating section)
{isReply ? (
  <div className="form-group">
    <label>Score (0-100) *</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={score} 
        onChange={(e) => setScore(parseInt(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: score >= 50 ? '#00ff88' : '#ff4444'
      }}>
        {score}/100
      </span>
    </div>
    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
      Score appears with color: <span style={{ color: '#00ff88' }}>Green (≥50)</span> or <span style={{ color: '#ff4444' }}>Red (&lt;50)</span>
    </div>
  </div>
) : (
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

// In handleSubmit, include score in reply data
if (isReply) {
  const replyData = {
    parent_id: parentComment.id,
    user_name: userName.trim(),
    user_age: birthYear,
    user_country: selectedCountry,
    profile_picture: profilePictureBase64,
    comment: comment.trim(),
    media_url: mediaUrl.trim() || null,
    score: score
  };
  result = await addCommentReply(replyData);
}
