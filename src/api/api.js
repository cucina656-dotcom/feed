// src/api/api.js

// Base URL for API calls (will be replaced with actual worker URL in production)
const API_BASE = '';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API call failed');
  }
  return data;
}

// Posts API
export async function getPosts() {
  try {
    const data = await apiCall('/api/posts');
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function createPost(formData) {
  return apiCall('/api/create-post', {
    method: 'POST',
    body: formData,
  });
}

// Comments API (Combined with rating)
export async function addCommentWithRating(commentData) {
  return apiCall('/api/comment-with-rating', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commentData),
  });
}

export async function getComments(postId) {
  return apiCall(`/api/comments?post_id=${encodeURIComponent(postId)}`);
}

export async function deleteComment(commentId, adminToken) {
  return apiCall('/api/admin/delete-comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify({ comment_id: commentId }),
  });
}

// Ratings API (for backward compatibility)
export async function addRating(ratingData) {
  return apiCall('/api/rate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ratingData),
  });
}

export async function getRatings(postId) {
  return apiCall(`/api/ratings?post_id=${encodeURIComponent(postId)}`);
}

// User API
export async function userLogin(phone, pin) {
  const formData = new FormData();
  formData.append('phone', phone);
  formData.append('pin', pin);
  return apiCall('/api/login', {
    method: 'POST',
    body: formData,
  });
}

export async function pinRecovery(phone) {
  const formData = new FormData();
  formData.append('phone', phone);
  return apiCall('/api/pin-recovery', {
    method: 'POST',
    body: formData,
  });
}

export async function getUserProfile(userId) {
  return apiCall(`/api/user/${userId}`);
}

export async function updateUserProfile(userId, userData) {
  return apiCall(`/api/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
}

// Admin API
export async function adminLogin(pin) {
  return apiCall('/admin/verify-pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin }),
  });
}

export async function adminGetAllUsers() {
  return apiCall('/api/admin/users');
}

export async function adminGetAllPosts() {
  return apiCall('/api/admin/posts');
}

export async function adminGetAllComments() {
  return apiCall('/api/admin/comments');
}

export async function adminDeletePost(postId, adminToken) {
  return apiCall('/api/admin/delete-post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify({ post_id: postId }),
  });
}

export async function adminDeleteUser(userId, adminToken) {
  return apiCall('/api/admin/delete-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function adminBlockUser(userId, adminToken) {
  return apiCall('/api/admin/block-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function adminUnblockUser(userId, adminToken) {
  return apiCall('/api/admin/unblock-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function adminCompleteRecovery(recoveryId, adminToken) {
  return apiCall('/api/admin/complete-recovery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken,
    },
    body: JSON.stringify({ recovery_id: recoveryId }),
  });
}

export async function adminGetPendingRecoveries(adminToken) {
  return apiCall('/api/admin/pending-recoveries', {
    headers: {
      'X-Admin-Token': adminToken,
    },
  });
}

// Subtitle API
export async function saveSubtitle(postId, subtitleData, adminToken) {
  return apiCall(`/api/post/${postId}/subtitle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(adminToken && { 'X-Admin-Token': adminToken }),
    },
    body: JSON.stringify(subtitleData),
  });
}

export async function getSubtitle(postId) {
  return apiCall(`/api/post/${postId}/subtitle`);
}

// View counter API
export async function incrementViews(postId) {
  return apiCall(`/api/post/${postId}/view`, {
    method: 'POST',
  });
}

export async function getViews(postId) {
  return apiCall(`/api/post/${postId}/views`);
}

// Storage for user session
export function saveUserSession(user, token) {
  localStorage.setItem('feedX_user', JSON.stringify(user));
  localStorage.setItem('feedX_token', token);
}

export function getUserSession() {
  const user = localStorage.getItem('feedX_user');
  const token = localStorage.getItem('feedX_token');
  return {
    user: user ? JSON.parse(user) : null,
    token: token || null,
  };
}

export function clearUserSession() {
  localStorage.removeItem('feedX_user');
  localStorage.removeItem('feedX_token');
}

export function isLoggedIn() {
  return !!localStorage.getItem('feedX_token');
}

// Storage for admin session
export function saveAdminSession(token) {
  localStorage.setItem('feedX_admin_token', token);
}

export function getAdminSession() {
  return localStorage.getItem('feedX_admin_token');
}

export function clearAdminSession() {
  localStorage.removeItem('feedX_admin_token');
}

export function isAdminLoggedIn() {
  return !!localStorage.getItem('feedX_admin_token');
}