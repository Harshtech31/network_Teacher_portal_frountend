import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('teacher_token'));

  // Configure axios defaults - now handled by apiClient interceptors

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await apiClient.get('/api/auth/me');
          if (response.data.success && response.data.data.user.role === 'teacher') {
            setUser(response.data.data.user);
          } else {
            // Not a teacher, clear token
            localStorage.removeItem('teacher_token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('teacher_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        // Check if user is a teacher
        if (userData.role !== 'teacher') {
          throw new Error('Access denied. Teacher privileges required.');
        }

        setUser(userData);
        setToken(authToken);
        localStorage.setItem('teacher_token', authToken);
        
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('teacher_token');
    // Token removal handled by apiClient interceptors
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
