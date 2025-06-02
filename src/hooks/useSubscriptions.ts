import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './useAuth';
import {
  fetchSubscriptions,
  fetchCategories,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  archiveSubscription,
  restoreSubscription,
  setFilter,
  setSortBy,
  clearError as clearSubscriptionError,
  fetchArchivedSubscriptions,
} from '../store/slices/subscriptionSlice';
import { AppDispatch, RootState } from '../store';

export const useSubscriptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const {
    subscriptions,
    filteredSubscriptions,
    categories,
    activeFilter,
    sortBy,
    sortDirection,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.subscriptions);

  const getSubscriptions = useCallback((type: 'active' | 'archived' = 'active') => {
    if (user?.id) {
      if (type === 'archived') {
        return dispatch(fetchArchivedSubscriptions(user.id));
      }
      return dispatch(fetchSubscriptions(user.id));
    }
  }, [dispatch, user?.id]);

  const getCategories = useCallback(() => {
    return dispatch(fetchCategories());
  }, [dispatch]);

  const addSubscription = useCallback(
    (data: any) => {
      return dispatch(createSubscription(data));
    },
    [dispatch]
  );

  const editSubscription = useCallback(
    (id: number, data: any) => {
      return dispatch(updateSubscription({ id, data }));
    },
    [dispatch]
  );

  const removeSubscription = useCallback(
    (id: number) => {
      return dispatch(deleteSubscription(id));
    },
    [dispatch]
  );

  const archive = useCallback(
    (id: number) => {
      return dispatch(archiveSubscription(id));
    },
    [dispatch]
  );

  const restore = useCallback(
    (id: number) => {
      return dispatch(restoreSubscription(id));
    },
    [dispatch]
  );

  const filterByCategory = useCallback(
    (category: string | null) => {
      dispatch(setFilter(category));
    },
    [dispatch]
  );

  const sort = useCallback(
    (sortBy: 'title' | 'price' | 'nextPaymentDate', direction: 'asc' | 'desc') => {
      dispatch(setSortBy({ sortBy, direction }));
    },
    [dispatch]
  );

  return {
    subscriptions,
    filteredSubscriptions,
    categories,
    activeFilter,
    sortBy,
    sortDirection,
    isLoading,
    error,
    getSubscriptions,
    getCategories,
    addSubscription,
    editSubscription,
    removeSubscription,
    archive,
    restore,
    filterByCategory,
    sort,
    clearError: clearSubscriptionError,
  };
};