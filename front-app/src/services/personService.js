import api from './api';

// Profil
export const getProfile = async (id) => {
  const response = await api.get(`/api/person/${id}/profile`);
  return response.data;
};

// Modifier profil
export const updateProfile = async (id, data) => {
  const response = await api.put(`/api/person/${id}/profile`, data);
  return response.data;
};

// Acheter une vidéo
export const buyVideo = async (personId, videoId) => {
  const response = await api.post(`/api/person/${personId}/buy/${videoId}`);
  return response.data;
};

// Vidéos achetées
export const getPurchasedVideos = async (id) => {
  const response = await api.get(`/api/person/${id}/purchased-videos`);
  return response.data;
};

// Mes vidéos (contributeur)
export const getMyVideos = async (id) => {
  const response = await api.get(`/api/person/${id}/my-videos`);
  return response.data;
};

// Solde
export const getBalance = async (id) => {
  const response = await api.get(`/api/person/${id}/balance`);
  return response.data;
};

// Ajouter crédits
export const addCredits = async (personId, amount, paymentMethod) => {
  const response = await api.post(`/api/person/${personId}/add-credits`, {
    amount, paymentMethod
  });
  return response.data;
};

// Retirer gains
export const withdrawEarnings = async (personId, amount, withdrawalMethod) => {
  const response = await api.post(`/api/person/${personId}/withdraw`, {
    amount, withdrawalMethod
  });
  return response.data;
};

// Stats ventes
export const getSalesStats = async (id) => {
  const response = await api.get(`/api/person/${id}/stats`);
  return response.data;
};

// Transactions
export const getMyTransactions = async (id) => {
  const response = await api.get(`/api/person/${id}/transactions`);
  return response.data;
};
