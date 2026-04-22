import api from './api';

// Toutes les vidéos
export const getAllVideos = async (page = 0, size = 20) => {
  const response = await api.get(`/api/videos?page=${page}&size=${size}`);
  return response.data;
};

// Vidéo par id
export const getVideoById = async (id) => {
  const response = await api.get(`/api/videos/${id}`);
  return response.data;
};

// Recherche
export const searchVideos = async (keyword, category, minPrice, maxPrice) => {
  const params = new URLSearchParams({ keyword });
  if (category) params.append('category', category);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);
  const response = await api.get(`/api/videos/search?${params}`);
  return response.data;
};

// Vidéos populaires
export const getPopularVideos = async (limit = 10) => {
  const response = await api.get(`/api/videos/popular?limit=${limit}`);
  return response.data;
};

// Vidéos récentes
export const getRecentVideos = async (limit = 10) => {
  const response = await api.get(`/api/videos/recent?limit=${limit}`);
  return response.data;
};

// Vidéos gratuites
export const getFreeVideos = async () => {
  const response = await api.get('/api/videos/free');
  return response.data;
};

// Vidéos tendance
export const getTrendingVideos = async () => {
  const response = await api.get('/api/videos/trending');
  return response.data;
};

// Vidéos par catégorie
export const getVideosByCategory = async (category, page = 0, size = 10) => {
  const response = await api.get(`/api/videos/category/${category}?page=${page}&size=${size}`);
  return response.data;
};

// Uploader une vidéo (contributeur)
export const uploadVideo = async (contributorId, formData) => {
  const response = await api.post(`/api/videos/upload/${contributorId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Modifier une vidéo
export const updateVideo = async (videoId, contributorId, videoData) => {
  const response = await api.put(`/api/videos/${videoId}?contributorId=${contributorId}`, videoData);
  return response.data;
};

// Supprimer une vidéo
export const deleteVideo = async (videoId, contributorId) => {
  const response = await api.delete(`/api/videos/${videoId}?contributorId=${contributorId}`);
  return response.data;
};

// Liker une vidéo
export const likeVideo = async (videoId) => {
  const response = await api.post(`/api/videos/${videoId}/like`);
  return response.data;
};

// Incrémenter les vues
export const watchVideo = async (videoId) => {
  const response = await api.post(`/api/videos/${videoId}/watch`);
  return response.data;
};

// Stats contributeur
export const getContributorStats = async (contributorId) => {
  const response = await api.get(`/api/videos/stats/contributor/${contributorId}`);
  return response.data;
};
