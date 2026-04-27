// ProtectedRoute — redirects unauthenticated users to /auth

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While Firebase checks session, show full-screen loader
  if (loading) return <LoadingSpinner fullScreen text="Loading..." />;

  // Not authenticated → redirect to auth page, preserve intended destination
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
