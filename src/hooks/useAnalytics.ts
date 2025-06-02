import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAnalyticsSummary,
  fetchMonthlySpending,
  fetchCategoryBreakdown,
  exportAnalyticsData,
  clearError as clearAnalyticsError,
} from '../store/slices/analyticsSlice';
import { AppDispatch, RootState } from '../store';
import { useAuth } from './useAuth';

export const useAnalytics = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const {
    monthlySpending,
    categoryBreakdown,
    totalMonthly,
    totalAnnual,
    isLoading,
    error,
    summary,
  } = useSelector((state: RootState) => state.analytics);

  const getAnalyticsSummary = useCallback(() => {
    if (!user?.id) return;
    return dispatch(fetchAnalyticsSummary(user.id));
  }, [dispatch, user?.id]);

  const getMonthlySpending = useCallback(
    (months: number = 12) => {
      if (!user?.id) return;
      return dispatch(fetchMonthlySpending({ userId: user.id, months }));
    },
    [dispatch, user?.id]
  );

  const getCategoryBreakdown = useCallback(() => {
    if (!user?.id) return;
    return dispatch(fetchCategoryBreakdown(user.id));
  }, [dispatch, user?.id]);

  const exportData = useCallback(
    (format: 'csv' | 'json' | 'pdf') => {
      if (!user?.id) return;
      return dispatch(exportAnalyticsData({ userId: user.id, format }));
    },
    [dispatch, user?.id]
  );

  const clearError = useCallback(() => {
    dispatch(clearAnalyticsError());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMonthlySpending(user.id));
      dispatch(fetchCategoryBreakdown(user.id));
    }
  }, [dispatch, user?.id]);

  return {
    monthlySpending,
    categoryBreakdown,
    totalMonthly,
    totalAnnual,
    isLoading,
    error,
    summary,
    getAnalyticsSummary,
    getMonthlySpending,
    getCategoryBreakdown,
    exportData,
    clearError,
  };
};