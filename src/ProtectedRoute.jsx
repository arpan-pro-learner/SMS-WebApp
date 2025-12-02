import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from './store/userStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useUserStore();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Use the role from the Zustand store
  const currentRole = user.role;

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    // Redirect to a default page if the current role is not allowed
    // This could be the user's own dashboard or an unauthorized page
    switch (currentRole) {
      case 'admin':
        return <Navigate to="/app/admin" replace />;
      case 'teacher':
        return <Navigate to="/app/teacher" replace />;
      case 'student':
        return <Navigate to="/app/student" replace />;
      default:
        // If the role is unknown, send to login
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
