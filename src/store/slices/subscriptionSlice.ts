import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionState, SubscriptionFormData, SubscriptionCategory, Subscription } from '../../types';
import { convertAmount } from '../../utils/currencyUtils';

const initialState: SubscriptionState = {
  subscriptions: [],
  filteredSubscriptions: [],
  categories: [],
  activeFilter: null,
  sortBy: 'nextPaymentDate',
  sortDirection: 'asc',
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchAll',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getActiveByUserId(userId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch subscriptions');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'subscriptions/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getAll();
      const categories = [...new Set(response.map(sub => sub.subscriptionCategory))];
      return categories;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (data: SubscriptionFormData, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.create(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async ({ id, data }: { id: number; data: Partial<SubscriptionFormData> }, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.update(id, data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update subscription');
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await subscriptionService.delete(id);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete subscription');
    }
  }
);

export const archiveSubscription = createAsyncThunk(
  'subscriptions/archive',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.archive(id);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to archive subscription');
    }
  }
);

export const restoreSubscription = createAsyncThunk(
  'subscriptions/restore',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.restore(id);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to restore subscription');
    }
  }
);

export const fetchArchivedSubscriptions = createAsyncThunk(
  'subscriptions/fetchArchived',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getArchivedByUserId(userId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch archived subscriptions');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<SubscriptionCategory | null>) => {
      state.activeFilter = action.payload;
      if (action.payload === null) {
        state.filteredSubscriptions = state.subscriptions;
      } else {
        state.filteredSubscriptions = state.subscriptions.filter(
          (sub) => sub.subscriptionCategory === action.payload
        );
      }
    },
    setSortBy: (state, action: PayloadAction<{ sortBy: 'title' | 'price' | 'nextPaymentDate'; direction: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.direction;
      
      // Sort subscriptions
      const sorted = [...state.filteredSubscriptions].sort((a, b) => {
        if (action.payload.sortBy === 'title') {
          return action.payload.direction === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (action.payload.sortBy === 'price') {
          // --- Currency and period aware sorting ---
          // Get user's selected currency and rates from state
          // TODO: Replace with a more robust way to access the current state if needed
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rootState = (window as any).store ? (window as any).store.getState() : null;
          const userCurrency = rootState?.settings?.currency || 'RUB';
          const rates = rootState?.settings?.rates || null;
          // Helper to normalize to monthly and convert
          function getMonthlyInUserCurrency(sub: Subscription) {
            let monthly = sub.price;
            if (sub.billingPeriodUnit === 'DAY') {
              // Use 30 as fallback, ideally use actual month days if available
              monthly = sub.price * 30 / sub.billingPeriodValue;
            } else if (sub.billingPeriodUnit === 'YEAR') {
              monthly = sub.price / (12 * sub.billingPeriodValue);
            } else if (sub.billingPeriodUnit === 'MONTH') {
              monthly = sub.billingPeriodValue === 1 ? sub.price : sub.price / sub.billingPeriodValue;
            }
            return convertAmount(monthly, sub.currency, userCurrency, rates);
          }
          const aVal = getMonthlyInUserCurrency(a);
          const bVal = getMonthlyInUserCurrency(b);
          return action.payload.direction === 'asc' 
            ? aVal - bVal
            : bVal - aVal;
        } else {
          // Sort by next payment date
          const aDate = a.nextPaymentDate ? new Date(a.nextPaymentDate).getTime() : 0;
          const bDate = b.nextPaymentDate ? new Date(b.nextPaymentDate).getTime() : 0;
          return action.payload.direction === 'asc' 
            ? aDate - bDate
            : bDate - aDate;
        }
      });
      
      state.filteredSubscriptions = sorted;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload || [];
        state.filteredSubscriptions = action.payload || [];
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions.push(action.payload);
        state.filteredSubscriptions = state.subscriptions;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.subscriptions.findIndex((sub) => sub.id === action.payload.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
          state.filteredSubscriptions = state.subscriptions;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = state.subscriptions.filter((sub) => sub.id !== action.payload);
        state.filteredSubscriptions = state.subscriptions;
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Archive subscription
      .addCase(archiveSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(archiveSubscription.fulfilled, (state, action) => {
        // Optimistically remove the archived subscription from the list
        state.subscriptions = state.subscriptions.filter((sub) => sub.id !== action.payload.id);
          state.filteredSubscriptions = state.subscriptions;
      })
      .addCase(archiveSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Restore subscription
      .addCase(restoreSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreSubscription.fulfilled, (state, action) => {
        // Optimistically remove the restored subscription from the list
        state.subscriptions = state.subscriptions.filter((sub) => sub.id !== action.payload.id);
          state.filteredSubscriptions = state.subscriptions;
      })
      .addCase(restoreSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch archived subscriptions
      .addCase(fetchArchivedSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArchivedSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload || [];
        state.filteredSubscriptions = action.payload || [];
      })
      .addCase(fetchArchivedSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, setSortBy, clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;