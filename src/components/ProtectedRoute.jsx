import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null, fallbackPath = '/login' }) => {
  console.log('=== PROTECTED ROUTE CHECK ===');
  console.log('Required role:', requiredRole);
  console.log('Fallback path:', fallbackPath);
  
  // Get token and user from localStorage
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
  
  console.log('Token found:', !!token);
  console.log('User string found:', !!userStr);
  console.log('Token value:', token);
  console.log('User string value:', userStr);
  
  // If no token, redirect to fallback path
  if (!token) {
    console.log('❌ No token found, redirecting to:', fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  // If requiredRole is specified, check user role
  if (requiredRole && userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('Parsed user:', user);
      console.log('User role:', user.role);
      console.log('Required role:', requiredRole);
      
      // If user role doesn't match required role
      if (user.role !== requiredRole) {
        console.log('❌ Role mismatch! Redirecting...');
        // Redirect based on user's actual role
        if (user.role === 'admin') {
          return <Navigate to="/admin/dashboard" replace />;
        }
        if (user.role === 'cashier') {
          return <Navigate to="/cashier/dashboard" replace />;
        }
        if (user.role === 'owner') {
          return <Navigate to="/owner/dashboard" replace />;
        }
        // If admin role is required but user is not admin, redirect to admin login
        if (requiredRole === 'admin') {
          return <Navigate to="/" replace />;
        }
        // Otherwise redirect to home
        return <Navigate to="/" replace />;
      } else {
        console.log('✅ Role match! Rendering children');
      }
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // If all checks pass, render children
  console.log('✅ All checks passed, rendering protected content');
  return children;
};

export default ProtectedRoute;