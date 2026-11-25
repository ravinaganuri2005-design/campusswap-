import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing session on initial render
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh user profile in background
          const res = await authService.getProfile();
          const updated = {
            id: res.data.id,
            email: res.data.email,
            full_name: res.data.full_name,
            college_name: res.data.profile?.college_name || '',
            phone_number: res.data.profile?.phone_number || '',
            bio: res.data.profile?.bio || '',
            year_of_study: res.data.profile?.year_of_study || '',
          };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { access, refresh, user: userData } = res.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const { tokens, user: userData } = res.data;

    if (tokens) {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const res = await authService.updateProfile(formData);
    const updated = {
      id: res.data.id,
      email: res.data.email,
      full_name: res.data.full_name,
      college_name: res.data.profile?.college_name || '',
      phone_number: res.data.profile?.phone_number || '',
      bio: res.data.profile?.bio || '',
      year_of_study: res.data.profile?.year_of_study || '',
    };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
