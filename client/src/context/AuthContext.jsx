import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state anyway
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const initiateOAuth = async (provider) => {
    try {
      const redirectPath = window.location.pathname;
      const response = await authAPI.initiateOAuth(provider, redirectPath);
      if (response.data.success) {
        window.location.href = response.data.data.authUrl;
      }
    } catch (error) {
      toast.error(`Failed to initiate ${provider} login`);
    }
  };

  const linkProvider = async (provider) => {
    try {
      const response = await authAPI.linkProvider(provider);
      if (response.data.success) {
        window.location.href = response.data.data.authUrl;
      }
    } catch (error) {
      const message = error.response?.data?.message || `Failed to link ${provider}`;
      toast.error(message);
    }
  };

  const unlinkProvider = async (provider) => {
    try {
      const response = await authAPI.unlinkProvider(provider);
      if (response.data.success) {
        toast.success(`${provider} account unlinked successfully`);
        await checkAuth(); // Refresh user data
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || `Failed to unlink ${provider}`;
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    initiateOAuth,
    linkProvider,
    unlinkProvider,
    updateUser,
    checkAuth,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
