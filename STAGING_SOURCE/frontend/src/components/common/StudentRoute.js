import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const StudentRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect organizers to organizer dashboard
  if (user?.role === 'organizer') {
    return <Navigate to="/organizer/dashboard" replace />;
  }

  // Redirect admins to admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Allow student (user) role
  if (user?.role !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default StudentRoute;
