import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Trash2, Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { format } from 'date-fns';
import { Notification } from '../../types';

interface NotificationsDropdownProps {
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const {
    notifications,
    getNotifications,
    readNotification,
    removeNotification,
    readAllNotifications,
    isLoading,
  } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  const handleMarkAsRead = (id: string) => {
    readNotification(id);
  };
  
  const handleDelete = (id: string) => {
    removeNotification(id);
  };
  
  const handleMarkAllAsRead = () => {
    readAllNotifications();
  };
  
  const getNotificationIcon = () => {
    return <Bell className="h-4 w-4" />;
  };
  
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, h:mm a');
  };
  
  return (
    <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50 border border-slate-200 dark:border-slate-700 animate-fade-in">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-medium">{t('notifications.title')}</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {t('notifications.markAllAsRead')}
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-slate-500">{t('common.loading')}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            {t('notifications.noNotifications')}
          </div>
        ) : (
          <ul>
            {notifications.map((notification: Notification) => (
              <li
                key={notification.id}
                className={`p-4 border-b border-slate-100 dark:border-slate-700 ${
                  !notification.read ? 'bg-primary-50 dark:bg-slate-700/30' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getNotificationIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                  <div className="ml-3 flex flex-col space-y-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                        title={t('notifications.markAsRead')}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-slate-400 hover:text-error-600 dark:text-slate-500 dark:hover:text-error-400"
                      title={t('notifications.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <a
          href="/notifications"
          className="block w-full text-center py-2 text-xs font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          onClick={onClose}
        >
          {t('dashboard.viewAll')}
        </a>
      </div>
    </div>
  );
};

export default NotificationsDropdown;