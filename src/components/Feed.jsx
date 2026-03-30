// src/components/Feed.jsx
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
      console.error('Error loading posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleViewPost = async (post) => {
    // Increment view count when post is viewed
    try {
      await incrementViews(post.id);
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const handleOpenCommentModal = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPost(null);
  };

  const handleCommentAdded = () => {
    // Refresh posts to update comment counts
    loadPosts();
  };

  if (loading) {
    return (
      <main className="twitter-layout">
        <div className="loading" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p className="text-muted mt-2">
            Loading amazing content...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="twitter-layout">
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😢</div>
          <h3 style={{ marginBottom: '20px' }}>Something went wrong</h3>
          <p className="text-muted" style={{ marginBottom: '30px' }}>
            {error}
          </p>
          <button className="quick-post button" onClick={() => loadPosts()} style={{ padding: '12px 24px' }}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <main className="twitter-layout">
        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✨</div>
          <h3 style={{ marginBottom: '20px' }}>No posts yet</h3>
          <p className="text-muted" style={{ marginBottom: '30px' }}>
            Be the first to share something amazing!
          </p>
          <Link to="/create" className="quick-post button" style={{ padding: '12px 30px', textDecoration: 'none', display: 'inline-block' }}>
            Create Your First Post
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="twitter-layout">
        {/* Left Sidebar */}
        <aside className="sidebar-left">
          {/* Profile Mini Card */}
          <div className="profile-mini-card">
            <div className="profile-cover"></div>
            <div className="user-avatar-large">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : '👤'}
            </div>
            <div className="profile-info">
              <div className="profile-meta">
                <h3>{currentUser?.name || 'Guest User'}</h3>
                <span>@{currentUser?.phone || 'guest'}</span>
              </div>
              <div className="profile-bio">
                {currentUser?.country ? `📍 ${currentUser.country}` : '🌍 Join the community'}
              </div>
              <div className="profile-stats">
                <div>
                  <strong>{posts.length}</strong>
                  <span>Posts</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>Following</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>Followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="nav-menu">
            <Link to="/" className="nav-item active">
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </Link>
            <Link to="/explore" className="nav-item">
              <span className="nav-icon">🔍</span>
              <span>Explore</span>
            </Link>
            <Link to="/notifications" className="nav-item">
              <span className="nav-icon">🔔</span>
              <span>Notifications</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span className="nav-icon">👤</span>
              <span>Profile</span>
            </Link>
            <Link to="/create" className="nav-item">
              <span className="nav-icon">✍️</span>
              <span>Create Post</span>
            </Link>
          </div>
        </aside>

        {/* Center Feed */}
        <div className="feed-stream">
          {/* Quick Post Box */}
          <div className="quick-post">
            <div className="post-avatar" style={{ width: '40px', height: '40px' }}>
              {currentUser?.name ? currentUser.name[0].toUpperCase() : '👤'}
            </div>
            <input 
              type="text" 
              placeholder="What's happening?" 
              onClick={() => window.location.href = '/create'}
              readOnly
            />
            <button onClick={() => window.location.href = '/create'}>Post</button>
          </div>

          {/* Posts Feed */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onView={handleViewPost}
              onComment={handleOpenCommentModal}
            />
          ))}
        </div>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <div className="trending-box">
            <h4>📈 Trending Now</h4>
            <div className="trending-item">
              <div className="trending-topic">#Marquee</div>
              <div className="trending-stats">Trending in your area</div>
            </div>
            <div className="trending-item">
              <div className="trending-topic">#ShareBooks</div>
              <div className="trending-stats">1.2K posts</div>
            </div>
            <div className="trending-item">
              <div className="trending-topic">#Community</div>
              <div className="trending-stats">843 posts</div>
            </div>
          </div>

          <div className="trending-box" style={{ marginTop: '20px' }}>
            <h4>👥 Who to follow</h4>
            <div className="trending-item">
              <div className="trending-topic">✨ Marquee Official</div>
              <div className="trending-stats">Follow</div>
            </div>
            <div className="trending-item">
              <div className="trending-topic">📚 Book Lovers</div>
              <div className="trending-stats">Follow</div>
            </div>
          </div>
        </aside>
      </main>

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <CommentModal
          post={selectedPost}
          currentUser={currentUser}
          onClose={handleCloseCommentModal}
          onSuccess={handleCommentAdded}
        />
      )}
    </>
  );
}

export default Feed;
