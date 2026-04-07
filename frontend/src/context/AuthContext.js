import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check auth on mount
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success(`Welcome, ${newUser.firstName}!`);
      
      // Navigate to role-specific dashboard
      if (newUser.role === 'admin') {
        navigate('/admin');
      } else if (newUser.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/feed');
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: loggedInUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${loggedInUser.firstName}!`);
      
      // Navigate to role-specific dashboard
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/feed');
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  // Google Auth
  const googleLogin = async (credential) => {
    try {
      const response = await authAPI.googleAuth(credential);
      const { token, user: googleUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(googleUser));
      setUser(googleUser);
      setIsAuthenticated(true);
      
      toast.success(`Welcome, ${googleUser.firstName}!`);
      
      // Navigate to role-specific dashboard
      if (googleUser.role === 'admin') {
        navigate('/admin');
      } else if (googleUser.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/feed');
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      toast.error(message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with local logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  // Update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    googleLogin,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
