import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  const isAuthenticated = () => !!token;
  const isAdmin = () => user?.role === 'ADMIN';
  const isContributor = () => user?.contributor === true;
  const isStudent = () => user?.role === 'PERSON' && !user?.contributor;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginUser, logoutUser,
      isAuthenticated, isAdmin,
      isContributor, isStudent
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};