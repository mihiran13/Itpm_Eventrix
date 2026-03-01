import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=auth_failed');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      // Fetch user data and redirect
      navigate('/feed');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, updateUser]);

  return <LoadingSpinner fullScreen text="Completing authentication..." />;
};

export default GoogleCallback;
