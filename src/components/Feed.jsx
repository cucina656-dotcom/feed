import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PostCard from './PostCard';
import CommentModal from './CommentModal';
import { getPosts, incrementViews } from '../api/api';

function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data || []);
      setError(null);
    } catch (err) {
      setError('System Uplink Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  if (loading) return <div className="loading"><div className="loading-spinner"></div></div>;

  return (
    <main className="container twitter-layout">
      {/* Left Sidebar: Old Twitter Style Profile Summary */}
      <aside className="sidebar-left">
        <div className="profile-mini-card glass-panel">
          <div className="profile-cover"></div>
          <div className="profile-info">
            <div className="user-avatar-large">
              {currentUser?.avatar ? <img src={currentUser.avatar} alt="Me" /> : 'U'}
            </div>
            <div className="profile-meta">
              <h3>{currentUser?.name || 'Neural Pilot'}</h3>
              <span>@{currentUser?.username || 'user_null'}</span>
            </div>
            <div className="profile-stats">
              <div><strong>1.2k</strong><span>Signals</span></div>
              <div><strong>842</strong><span>Nodes</span></div>
            </div>
          </div>
        </div>
        
        <div className="trending-box glass-panel">
          <h4>Neural Trends</h4>
          <p>#CyberSecurity</p>
          <p>#Web3_Void</p>
          <p>#React_Neon</p>
        </div>
      </aside>

      {/* Center: The Feed */}
      <section className="feed-main">
        {/* Quick Post Box */}
        <div className="quick-post glass-panel">
          <input type="text" placeholder="What's happening in the grid?" />
          <button className="btn primary">Broadcast</button>
        </div>

        <div className="feed-stream">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onView={() => incrementViews(post.id)}
              onComment={(p) => { setSelectedPost(p); setShowCommentModal(true); }}
            />
          ))}
        </div>
      </section>

      {/* Right Sidebar: Suggestions */}
      <aside className="sidebar-right">
        <div className="glass-panel recommendations">
          <h4>Who to Follow</h4>
          <div className="rec-item"><span>@AI_Sentinel</span><button className="btn">Link</button></div>
          <div className="rec-item"><span>@Ghost_In_JS</span><button className="btn">Link</button></div>
        </div>
      </aside>

      {showCommentModal && selectedPost && (
        <CommentModal
          post={selectedPost}
          onClose={() => setShowCommentModal(false)}
          onSuccess={loadPosts}
        />
      )}
    </main>
  );
}

export default Feed;
