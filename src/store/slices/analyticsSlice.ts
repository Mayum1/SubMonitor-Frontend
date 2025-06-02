import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsState } from '../../types';

const initialState: AnalyticsState = {
  monthlySpending: [],
  categoryBreakdown: [],
  totalMonthly: 0,
  totalAnnual: 0,
  isLoading: false,
  error: null,
  summary: undefined,
};

// Async thunks
export const fetchAnalyticsSummary = createAsyncThunk(
  'analytics/fetchSummary',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getSummary(userId);
      console.log('Response from analyticsService.getSummary:', response);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch analytics summary');
    }
  }
);

export const fetchMonthlySpending = createAsyncThunk(
  'analytics/fetchMonthlySpending',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getMonthlySpending(userId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch monthly spending');
    }
  }
);

export const fetchCategoryBreakdown = createAsyncThunk(
  'analytics/fetchCategoryBreakdown',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCategoryBreakdown(userId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch category breakdown');
    }
  }
);

export const exportAnalyticsData = createAsyncThunk(
  'analytics/exportData',
  async ({ userId, format }: { userId: number; format: 'csv' | 'json' | 'pdf' }, { rejectWithValue }) => {
    try {
      const blob = await analyticsService.exportData(userId, format);
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscription-data.${format}`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to export data');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch summary
    builder.addCase(fetchAnalyticsSummary.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
      state.isLoading = false;
      // Log the raw payload and the extracted summary
      console.log('Raw action.payload:', action.payload);
      const summary = (action.payload && typeof action.payload === 'object' && 'data' in action.payload)
        ? (action.payload.data as unknown as import('../../types').DashboardSummary)
        : (action.payload as unknown as import('../../types').DashboardSummary);
      console.log('Extracted summary:', summary);
      state.summary = summary;
      state.totalMonthly = summary?.totalMonthlySpending || 0;
      state.totalAnnual = (summary?.totalMonthlySpending || 0) * 12;
    });
    builder.addCase(fetchAnalyticsSummary.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch monthly spending
    builder.addCase(fetchMonthlySpending.fulfilled, (state, action) => {
      state.monthlySpending = action.payload;
    });
    
    // Fetch category breakdown
    builder.addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
      state.categoryBreakdown = action.payload;
    });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;