import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authApi.getCurrentUser();
    if (savedUser && authApi.isAuthenticated()) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await authApi.login(email, password);
    setUser(result.user);
    return result;
  };

  const register = async (userData) => {
    return await authApi.register(userData);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await authApi.logout(refreshToken);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: authApi.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};