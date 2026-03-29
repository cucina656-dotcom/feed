// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  adminGetAllUsers, 
  adminGetAllPosts, 
  adminGetAllComments,
  adminDeletePost, 
  adminBlockUser, 
  adminUnblockUser,
  adminDeleteComment,
  adminCompleteRecovery,
  adminGetPendingRecoveries,
  getAdminSession,
  clearAdminSession
} from '../api/api';
import { formatDate } from '../utils/time';
import { getCountryByCode } from '../utils/countries';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const adminToken = getAdminSession();

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'posts') {
        const data = await adminGetAllPosts();
        setPosts(data.posts || []);
      } else if (activeTab === 'users') {
        const data = await adminGetAllUsers();
        setUsers(data.users || []);
      } else if (activeTab === 'comments') {
        const data = await adminGetAllComments();
        setComments(data.comments || []);
      } else if (activeTab === 'recoveries') {
        const data = await adminGetPendingRecoveries(adminToken);
        setRecoveries(data.recoveries || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await adminDeletePost(postId, adminToken);
      setSuccess('Post deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      setTimeout(() => setError(''), 3000);
    }
    setConfirmDelete(null);
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await adminUnblockUser(userId, adminToken);
        setSuccess('User unblocked successfully');
      } else {
        await adminBlockUser(userId, adminToken);
        setSuccess('User blocked successfully');
      }
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await adminDeleteComment(commentId, adminToken);
      setSuccess('Comment deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCompleteRecovery = async (recoveryId) => {
    try {
      const result = await adminCompleteRecovery(recoveryId, adminToken);
      setSuccess(result.message || 'PIN recovery completed');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to complete recovery');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin');
  };

  if (loading && activeTab === 'posts') {
    return (
      <main className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="post-card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Dashboard
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleLogout} className="btn danger" style={{ background: 'rgba(255,0,110,0.2)' }}>
                🚪 Logout
              </button>
              <Link to="/" className="btn">← Back to Site</Link>
            </div>
          </div>

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
              ❌ {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <button
              className={`btn ${activeTab === 'posts' ? 'primary' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              📄 Posts ({posts.length})
            </button>
            <button
              className={`btn ${activeTab === 'users' ? 'primary' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users ({users.length})
            </button>
            <button
              className={`btn ${activeTab === 'comments' ? 'primary' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              💬 Comments ({comments.length})
            </button>
            <button
              className={`btn ${activeTab === 'recoveries' ? 'primary' : ''}`}
              onClick={() => setActiveTab('recoveries')}
            >
              🔓 PIN Recovery ({recoveries.length})
            </button>
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>All Posts</h3>
              {posts.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No posts found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Title</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>User</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>WhatsApp</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Country</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Created</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => {
                        const countryData = getCountryByCode(post.country);
                        return (
                          <tr key={post.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px' }}>
                              {post.title?.substring(0, 50)}{post.title?.length > 50 ? '...' : ''}
                            </td>
                            <td style={{ padding: '10px' }}>{post.user_name || 'Anonymous'}</td>
                            <td style={{ padding: '10px' }}>{post.phone || 'N/A'}</td>
                            <td style={{ padding: '10px' }}>
                              {countryData?.flag && (
                                <img src={countryData.flag} alt="" style={{ width: '20px', height: '15px', marginRight: '5px' }} />
                              )}
                              {post.country || 'Unknown'}
                            </td>
                            <td style={{ padding: '10px' }}>{formatDate(post.created_at)}</td>
                            <td style={{ padding: '10px' }}>
                              <Link to={`/post?id=${post.id}`} target="_blank" className="btn" style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}>
                                View
                              </Link>
                              <button
                                onClick={() => setConfirmDelete({ type: 'post', id: post.id, title: post.title })}
                                className="btn"
                                style={{ padding: '5px 10px', fontSize: '12px', background: 'rgba(255,0,110,0.2)' }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>All Users</h3>
              {users.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No users found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>WhatsApp</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Country</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Joined</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const countryData = getCountryByCode(user.country);
                        return (
                          <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px' }}>{user.name || 'Anonymous'}</td>
                            <td style={{ padding: '10px' }}>{user.phone}</td>
                            <td style={{ padding: '10px' }}>
                              {countryData?.flag && (
                                <img src={countryData.flag} alt="" style={{ width: '20px', height: '15px', marginRight: '5px' }} />
                              )}
                              {user.country || 'Unknown'}
                            </td>
                            <td style={{ padding: '10px' }}>{formatDate(user.created_at)}</td>
                            <td style={{ padding: '10px' }}>
                              <span className={user.blocked ? 'alert-danger' : 'alert-success'} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                                {user.blocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <button
                                onClick={() => handleBlockUser(user.id, user.blocked)}
                                className="btn"
                                style={{ padding: '5px 10px', fontSize: '12px', background: user.blocked ? 'rgba(0,245,212,0.2)' : 'rgba(255,0,110,0.2)' }}
                              >
                                {user.blocked ? 'Unblock' : 'Block'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>All Comments</h3>
              {comments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No comments found</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>User</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Rating</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Comment</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Post</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map((comment) => (
                        <tr key={comment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px' }}>
                            {comment.user_name}
                            {comment.user_age && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Age: {new Date().getFullYear() - comment.user_age}</div>}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
                          </td>
                          <td style={{ padding: '10px', maxWidth: '300px' }}>
                            {comment.comment?.substring(0, 100)}{comment.comment?.length > 100 ? '...' : ''}
                            {comment.media_url && (
                              <div><a href={comment.media_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--secondary)' }}>🔗 Link</a></div>
                            )}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <Link to={`/post?id=${comment.post_id}`} target="_blank" style={{ color: 'var(--secondary)' }}>
                              View Post
                            </Link>
                          </td>
                          <td style={{ padding: '10px' }}>{formatDate(comment.created_at)}</td>
                          <td style={{ padding: '10px' }}>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="btn"
                              style={{ padding: '5px 10px', fontSize: '12px', background: 'rgba(255,0,110,0.2)' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PIN Recovery Tab */}
          {activeTab === 'recoveries' && (
            <div>
              <h3 style={{ marginBottom: '20px' }}>Pending PIN Recovery Requests</h3>
              {recoveries.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No pending recovery requests</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Requested</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>New PIN</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recoveries.map((recovery) => (
                        <tr key={recovery.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px' }}>{recovery.phone}</td>
                          <td style={{ padding: '10px' }}>{formatDate(recovery.requested_at)}</td>
                          <td style={{ padding: '10px' }}>
                            <strong style={{ color: 'var(--accent)', fontSize: '18px' }}>{recovery.plain_pin}</strong>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <button
                              onClick={() => handleCompleteRecovery(recovery.id)}
                              className="btn success"
                              style={{ padding: '5px 15px', fontSize: '12px' }}
                            >
                              Complete & Send
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            background: 'var(--card-gradient)',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '400px',
            textAlign: 'center',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
              Are you sure you want to delete "{confirmDelete.title?.substring(0, 50)}"?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleDeletePost(confirmDelete.id)}
                className="btn"
                style={{ background: 'rgba(255,0,110,0.2)' }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;