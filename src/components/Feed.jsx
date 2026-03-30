import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // For that futuristic "flow"
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
      setError('System connection interrupted');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Loading State: Shimmering "Glass" skeletons
  if (loading) {
    return (
      <main className="feed-container">
        <div className="loader-mesh">
          <div className="spinner-neon"></div>
          <p className="glitch-text" data-text="INITIALIZING... ">INITIALIZING...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
          NEURAL FEED
        </h1>
      </header>

      <AnimatePresence>
        {posts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  onView={() => incrementViews(post.id)}
                  onComment={() => { setSelectedPost(post); setShowCommentModal(true); }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState />
        )}
      </AnimatePresence>

      {showCommentModal && (
        <CommentModal
          post={selectedPost}
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </main>
  );
}

const EmptyState = () => (
  <div className="glass-panel p-20 text-center border border-white/10 rounded-3xl">
    <div className="text-6xl mb-6 animate-pulse">🛰️</div>
    <h3 className="text-2xl font-bold text-white mb-2">Void Detected</h3>
    <p className="text-gray-400 mb-8">No signals found in this sector.</p>
    <Link to="/create" className="neon-button">
      Broadcast Signal
    </Link>
  </div>
);

export default Feed;
