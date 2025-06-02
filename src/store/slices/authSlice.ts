import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { AuthState, User } from '../../types';

// Add this function at the top of the file, after the imports
const decodeJwtToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// Load auth state from localStorage
const loadAuthState = (): { token: string | null; user: User | null } => {
  try {
    const userStr = localStorage.getItem('user');
    console.log('Loading auth state from localStorage:', userStr);
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log('Parsed user data:', userData);
      
      if (userData.token) {
        const decodedToken = decodeJwtToken(userData.token);
        console.log('Decoded token:', decodedToken);
        
        if (decodedToken) {
          return {
            token: userData.token,
            user: {
              id: userData.id,
              email: userData.email,
              role: userData.role || 'USER'
            }
          };
        }
      }
    }
    return { token: null, user: null };
  } catch (error) {
    console.error('Failed to load auth state:', error);
    return { token: null, user: null };
  }
};

const initialState: AuthState = {
  ...loadAuthState(),
  isAuthenticated: !!loadAuthState().token,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ email, password });
      return response; // response: { token, user: { id, email, role } }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(errorResponse.response?.data?.message || 'Login failed');
      }
      return rejectWithValue('Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.register({ email, password });
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(errorResponse.response?.data?.message || 'Registration failed');
      }
      return rejectWithValue('Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(errorResponse.response?.data?.message || 'Failed to fetch user');
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(errorResponse.response?.data?.message || 'Profile update failed');
      }
      return rejectWithValue('Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Remove user from localStorage
      localStorage.removeItem('user');
      
      // Reset state
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.user.id,
        email: action.payload.user.email,
        role: action.payload.user.role
      };
      state.token = action.payload.token;
      // Save to localStorage
      const userData = {
        token: action.payload.token,
        id: action.payload.user.id,
        email: action.payload.user.email,
        role: action.payload.user.role
      };
      localStorage.setItem('user', JSON.stringify(userData));
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      let user, token;
      if (action.payload.data && action.payload.data.user && action.payload.data.token) {
        user = action.payload.data.user;
        token = action.payload.data.token;
      } else {
        const flat = action.payload as any;
        user = {
          id: flat.id,
          email: flat.email,
          role: flat.role
      };
        token = flat.token;
      }
      // Remove 'Bearer ' prefix if present
      if (token?.startsWith('Bearer ')) {
        token = token.substring(7);
      }
      state.user = user;
      state.token = token;
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify({
        token,
        id: user.id,
        email: user.email,
        role: user.role
      }));
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
          state.user = {
          id: action.payload.id,
          email: action.payload.email,
            role: action.payload.role
          };
          state.token = action.payload.token;
          state.isAuthenticated = true;
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
    });
    
    // Update profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify({
        token: state.token,
        id: state.user.id,
        email: action.payload.email,
        role: action.payload.role
      }));
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;