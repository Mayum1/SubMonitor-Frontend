import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSettings,
  updateSettings,
  updateTheme,
  clearError as clearSettingsError,
} from '../store/slices/settingsSlice';
import { AppDispatch, RootState } from '../store';
import { UserSettings } from '../types';

export const useSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, isLoading, error } = useSelector(
    (state: RootState) => state.settings
  );

  const getSettings = useCallback(() => {
    return dispatch(fetchSettings());
  }, [dispatch]);

  const saveSettings = useCallback(
    (data: Partial<UserSettings>) => {
      return dispatch(updateSettings(data));
    },
    [dispatch]
  );

  const changeTheme = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      dispatch(updateTheme(theme));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearSettingsError());
  }, [dispatch]);

  return {
    settings,
    isLoading,
    error,
    getSettings,
    saveSettings,
    changeTheme,
    clearError,
  };
};