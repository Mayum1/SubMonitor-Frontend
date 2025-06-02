import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import analyticsReducer from './slices/analyticsSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subscriptions: subscriptionReducer,
    notifications: notificationReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.createdAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;