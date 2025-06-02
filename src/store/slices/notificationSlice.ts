import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';
import { NotificationState } from '../../types';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data.count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((notification) => !notification.read).length;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch unread count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
    
    // Mark as read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      }
    });
    
    // Mark all as read
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    });
    
    // Delete notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const deletedNotification = state.notifications.find((n) => n.id === action.payload);
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      
      if (deletedNotification && !deletedNotification.read) {
        state.unreadCount -= 1;
      }
    });
  },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;