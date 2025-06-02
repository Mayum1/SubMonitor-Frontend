import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import SubscriptionPresetPage from './pages/SubscriptionPresetPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Settings from './pages/Settings';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading, fetchCurrentUser } = useAuth();
  const { i18n } = useTranslation();
  
  // Initialize auth state only once when the app loads
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && !isAuthenticated) {
      console.log('Found user in localStorage, fetching current user...');
      fetchCurrentUser();
    }
  }, []); // Empty dependency array means this runs only once on mount
  
  // Apply language direction for RTL languages
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="subscriptions/presets" element={<SubscriptionPresetPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="notifications" element={<div>Notifications</div>} />
        <Route path="settings" element={<Settings />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;