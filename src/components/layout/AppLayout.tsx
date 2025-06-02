import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useNotifications } from '../../hooks/useNotifications';

const AppLayout: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { settings, getSettings } = useSettings();
  const { getUnreadCount } = useNotifications();
  const { i18n } = useTranslation();
  
  // Apply theme from settings
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (settings.theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);
  
  // Initialize data
  useEffect(() => {
    if (isAuthenticated) {
      getSettings();
      getUnreadCount();
    }
  }, [isAuthenticated, getSettings, getUnreadCount]);
  
  // Set language from user preference
  useEffect(() => {
    if (user?.preferredLanguage && i18n.language !== user.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
    }
  }, [user, i18n]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // If not authenticated, don't render anything
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;