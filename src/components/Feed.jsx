// src/components/Feed.jsx - Score version
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
    loadPosts();
  };

  if (loading) {
    return (
      <main className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>
            Loading amazing content...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div
          style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            padding: '60px 20px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😢</div>
          <h3 style={{ marginBottom: '20px' }}>Something went wrong</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            {error}
          </p>
          <button className="btn primary" onClick={() => loadPosts()}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <main className="container">
        <div
          style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            padding: '60px 20px',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✨</div>
          <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>
            No posts yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            Be the first to share something amazing!
          </p>
          <Link to="/create" className="btn primary" style={{ padding: '15px 30px' }}>
            Create Your First Post
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="feed">
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

      {showCommentModal && selectedPost && (
        <CommentModal
          post={selectedPost}
          currentUser={currentUser}
          onClose={handleCloseCommentModal}
          onSuccess={handleCommentAdded}
        />
      )}
    </main>
  );
}

export default Feed;
