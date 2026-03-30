const API_BASE = 'https://modekit.cucina656.workers.dev';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API call failed');
  return data;
}

export async function getPosts() {
  try {
    const data = await apiCall('/api/posts');
    return data;
  } catch (error) {
    return [];
  }
}

export async function createPost(formData) {
  return apiCall('/api/create-post', { method: 'POST', body: formData });
}

export async function userLogin(phone, pin) {
  const formData = new FormData();
  formData.append('phone', phone);
  formData.append('pin', pin);
  return apiCall('/api/login', { method: 'POST', body: formData });
}

export async function pinRecovery(phone) {
  const formData = new FormData();
  formData.append('phone', phone);
  return apiCall('/api/pin-recovery', { method: 'POST', body: formData });
}

export async function addCommentWithRating(commentData) {
  return apiCall('/api/comment-with-rating', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  });
}

export async function getComments(postId) {
  return apiCall(`/api/comments?post_id=${encodeURIComponent(postId)}`);
}

export async function getRatings(postId) {
  return apiCall(`/api/ratings?post_id=${encodeURIComponent(postId)}`);
}

export async function incrementViews(postId) {
  return apiCall('/api/post/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: postId }),
  });
}

export async function getViews(postId) {
  return apiCall(`/api/post/views?post_id=${encodeURIComponent(postId)}`);
}

export async function adminLogin(pin) {
  return apiCall('/admin/verify-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
    body: JSON.stringify({ post_id: postId }),
  });
}

export async function adminDeleteComment(commentId, adminToken) {
  return apiCall('/api/admin/delete-comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
    body: JSON.stringify({ comment_id: commentId }),
  });
}

export async function adminBlockUser(userId, adminToken) {
  return apiCall('/api/admin/block-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function adminUnblockUser(userId, adminToken) {
  return apiCall('/api/admin/unblock-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function adminCompleteRecovery(recoveryId, adminToken) {
  return apiCall('/api/admin/complete-recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
    body: JSON.stringify({ recovery_id: recoveryId }),
  });
}

export async function adminGetPendingRecoveries(adminToken) {
  return apiCall('/api/admin/pending-recoveries', {
    headers: { 'X-Admin-Token': adminToken },
  });
}

// NEW: Add reply to comment
export async function addCommentReply(data) {
  return apiCall('/api/comment/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// NEW: Hide comment
export async function hideComment(commentId) {
  return apiCall('/api/comment/hide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment_id: commentId }),
  });
}

export function saveUserSession(user, token) {
  localStorage.setItem('feedX_user', JSON.stringify(user));
  localStorage.setItem('feedX_token', token);
}

export function getUserSession() {
  const user = localStorage.getItem('feedX_user');
  const token = localStorage.getItem('feedX_token');
  return { user: user ? JSON.parse(user) : null, token: token || null };
}

export function getAdminSession() {
  return localStorage.getItem('feedX_admin_token');
}

export function saveAdminSession(token) {
  localStorage.setItem('feedX_admin_token', token);
}

export function clearAdminSession() {
  localStorage.removeItem('feedX_admin_token');
}

export function clearUserSession() {
  localStorage.removeItem('feedX_user');
  localStorage.removeItem('feedX_token');
}
