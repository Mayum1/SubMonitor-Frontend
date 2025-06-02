import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  login, 
  register, 
  logout, 
  updateProfile, 
  getCurrentUser,
  clearError as clearAuthError
} from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const loginUser = useCallback(
    (email: string, password: string) => {
      console.log('useAuth: Dispatching login action...');
      return dispatch(login({ email, password })).unwrap();
    },
    [dispatch]
  );

  const registerUser = useCallback(
    (email: string, password: string) => {
      return dispatch(register({ email, password })).unwrap();
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const updateUserProfile = useCallback(
    (userData: any) => {
      return dispatch(updateProfile(userData));
    },
    [dispatch]
  );

  const fetchCurrentUser = useCallback(() => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    fetchCurrentUser,
    clearError,
  };
};