import api from './api';

// Inscription étudiant
export const register = async (userData) => {
  const response = await api.post('/api/auth/person/register', userData);
  return response.data;
};

// Connexion étudiant/contributeur
export const login = async (credentials) => {
  const response = await api.post('/api/auth/person/login', credentials);
  return response.data;
};

// Inscription admin
export const registerAdmin = async (adminData) => {
  const response = await api.post('/api/admin/register', adminData);
  return response.data;
};

// Connexion admin
export const loginAdmin = async (credentials) => {
  const response = await api.post('/api/admin/login', credentials);
  return response.data;
};

// Déconnexion
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};
