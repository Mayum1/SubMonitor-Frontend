import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import { ApiResponse, UserSettings } from '../../types';
import { fetchRates, SUPPORTED_CURRENCIES, CurrencyRates } from '../../services/currencyService';
import { updateUserSettings, fetchUserSettings } from '../../services/api';

const loadSettings = (): UserSettings => {
  try {
    const settings = localStorage.getItem('userSettings');
    return settings
      ? JSON.parse(settings)
      : {
          notifyBeforeRenewal: true,
          renewalNotificationDays: 3,
          notifyOnPriceChange: true,
          defaultCurrency: 'USD',
          defaultTimezone: 'Europe/Moscow',
          theme: 'light',
        };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      notifyBeforeRenewal: true,
      renewalNotificationDays: 3,
      notifyOnPriceChange: true,
      defaultCurrency: 'USD',
      defaultTimezone: 'Europe/Moscow',
      theme: 'light',
    };
  }
};

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  currency: string;
  rates: CurrencyRates | null;
}

const initialState: SettingsState = {
  settings: loadSettings(),
  isLoading: false,
  error: null,
  currency: 'RUB',
  rates: null,
};

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('User not authenticated');
      const response = await fetchUserSettings(userId);
      // Use defaultCurrency and defaultTimezone from user object
      return {
        ...state.settings.settings,
        defaultCurrency: response.data.defaultCurrency,
        defaultTimezone: response.data.defaultTimezone,
        isTelegramLinked: response.data.isTelegramLinked,
      };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (settings: Partial<UserSettings>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const userId = state.auth.user?.id;
      if (!userId) throw new Error('User not authenticated');
      await updateUserSettings(userId, settings);
      // Return the new settings for Redux/localStorage
      return { ...state.settings.settings, ...settings };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update settings');
    }
  }
);

export const fetchCurrencyRates = createAsyncThunk(
  'settings/fetchCurrencyRates',
  async (currency: string, { rejectWithValue }) => {
    try {
      const rates = await fetchRates(currency);
      return rates;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || 'Failed to fetch currency rates');
      }
      return rejectWithValue('Failed to fetch currency rates');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.settings.theme = action.payload;
      localStorage.setItem('userSettings', JSON.stringify(state.settings));
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      if (SUPPORTED_CURRENCIES.includes(action.payload)) {
        state.currency = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch settings
    builder.addCase(fetchSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.settings = action.payload;
      state.currency = action.payload.defaultCurrency;
      localStorage.setItem('userSettings', JSON.stringify(action.payload));
    });
    builder.addCase(fetchSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Update settings
    builder.addCase(updateSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.settings = action.payload;
      localStorage.setItem('userSettings', JSON.stringify(action.payload));
    });
    builder.addCase(updateSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchCurrencyRates.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrencyRates.fulfilled, (state, action) => {
      state.isLoading = false;
      state.rates = action.payload;
    });
    builder.addCase(fetchCurrencyRates.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { updateTheme, setCurrency, clearError } = settingsSlice.actions;
export default settingsSlice.reducer;