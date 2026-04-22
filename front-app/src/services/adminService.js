import api from './api';

// Utilisateurs
export const getAllUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/block`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/unblock`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const validateUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/validate`);
  return response.data;
};

// Vidéos
export const getAllVideosAdmin = async () => {
  const response = await api.get('/api/admin/videos');
  return response.data;
};

export const getPendingVideos = async () => {
  const response = await api.get('/api/admin/videos/pending');
  return response.data;
};

export const validateVideo = async (videoId) => {
  const response = await api.patch(`/api/admin/videos/${videoId}/validate`);
  return response.data;
};

export const rejectVideo = async (videoId) => {
  const response = await api.patch(`/api/admin/videos/${videoId}/reject`);
  return response.data;
};

export const deleteVideoAdmin = async (videoId) => {
  const response = await api.delete(`/api/admin/videos/${videoId}`);
  return response.data;
};

// Transactions
export const getAllTransactions = async () => {
  const response = await api.get('/api/admin/transactions');
  return response.data;
};

// Statistiques
export const getAdminStats = async () => {
  const response = await api.get('/api/admin/stats/overview');
  return response.data;
};

export const getDailyStats = async () => {
  const response = await api.get('/api/admin/stats/daily');
  return response.data;
};
