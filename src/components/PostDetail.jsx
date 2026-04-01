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
        style={{ flex: 1 }}
      />
      <span style={{ 
        fontSize: '24px', 
        fontWeight: 'bold',
        color: score >= 50 ? '#00ff88' : '#ff4444',
        minWidth: '60px'
      }}>
        {score}/100
      </span>
    </div>
  </div>
)}
