export default function ScoreReplyCard({ reply }) {
  const {
    user_name,
    user_age,
    user_country,
    profile_picture,
    comment,
    score,
    created_at,
    target_user // YOU SHOULD ADD THIS
  } = reply;

  const getScoreLabel = () => {
    if (score < 40) return "Low Match";
    if (score < 70) return "Average";
    return "Good Match";
  };

  return (
    <div className="score-card">

      {/* HEADER */}
      <div className="score-header">
        <img src={profile_picture} className="avatar" />

        <div>
          <div className="name">
            {user_name} 🇷🇼 ({new Date().getFullYear() - user_age} yrs)
          </div>

          <div className="action">
            Rated <span>@{target_user || "User"}</span>
          </div>
        </div>
      </div>

      {/* SCORE */}
      <div className="score-value">
        ⭐ {score} / 100
      </div>

      <div className="score-badge">
        ⚠️ {getScoreLabel()}
      </div>

      {/* COMMENT */}
      <div className="comment">
        "{comment}"
      </div>

      {/* FOOTER */}
      <div className="footer">
        ⏱ {created_at}
      </div>

    </div>
  );
}
