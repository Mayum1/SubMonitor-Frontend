import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearError as clearNotificationError,
} from '../store/slices/notificationSlice';
import { AppDispatch, RootState } from '../store';

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading, error } = useSelector(
    (state: RootState) => state.notifications
  );

  const getNotifications = useCallback(() => {
    return dispatch(fetchNotifications());
  }, [dispatch]);

  const getUnreadCount = useCallback(() => {
    return dispatch(fetchUnreadCount());
  }, [dispatch]);

  const readNotification = useCallback(
    (id: string) => {
      return dispatch(markAsRead(id));
    },
    [dispatch]
  );

  const readAllNotifications = useCallback(() => {
    return dispatch(markAllAsRead());
  }, [dispatch]);

  const removeNotification = useCallback(
    (id: string) => {
      return dispatch(deleteNotification(id));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearNotificationError());
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    getNotifications,
    getUnreadCount,
    readNotification,
    readAllNotifications,
    removeNotification,
    clearError,
  };
};