// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react';
import { Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route} from 'react-router-dom';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import LandingPage from './pages/user/LandingPage';
import MovieList from './pages/user/MovieList';
import MovieDetail from './pages/user/MovieDetail';
import BookingPage from './pages/user/BookingPage';
import ContactPage from './pages/user/ContactPage';
import AboutPage from './pages/user/AboutPage';
import Profile from './pages/user/Profile';
import AuthCallback from './pages/auth/AuthCallback';
import TicketPage from './pages/user/TicketPage';

import AdminLogin from './pages/admin/AdminLogin';
import InvoicePage from './pages/user/InvoicePage.jsx';
import DashboardPage from './pages/admin/DashboardPage';
import TicketDetailPage from './pages/user/TicketDetailPage';
import CashierDashboard from './pages/cashier/CashierDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/movies" element={<MovieList />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/movie-detail" element={<MovieDetail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Routes - Hanya untuk user yang sudah login */}
        <Route path="/booking/:id" element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/invoice/:id" element={
          <ProtectedRoute>
            <InvoicePage />
          </ProtectedRoute>
        } />
        
        <Route path="/invoice" element={
          <ProtectedRoute>
            <InvoicePage />
          </ProtectedRoute>
        } />
        
        <Route path="/ticket" element={
          <ProtectedRoute>
            <TicketPage />
          </ProtectedRoute>
        } />
        
        <Route path="/ticket/:id" element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Protected Route */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin" fallbackPath="/">
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Cashier Protected Route */}
        <Route path="/cashier/dashboard" element={
          <ProtectedRoute requiredRole="cashier" fallbackPath="/">
            <CashierDashboard />
          </ProtectedRoute>
        } />
        
        {/* Owner Protected Route */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute requiredRole="owner" fallbackPath="/">
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  // {/* </StrictMode>, */}
)