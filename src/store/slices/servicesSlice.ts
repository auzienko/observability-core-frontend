import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { servicesApi, type ServiceData } from '../../api/servicesApi';
import type { MonitoredServiceResponse } from '../../types/service';
import type { HealthCheckResponse } from '../../types/health';

interface ServicesState {
  items: MonitoredServiceResponse[];
  currentService: MonitoredServiceResponse | null;
  healthHistory: HealthCheckResponse[];
  healthHistoryLoading: boolean;
  healthHistoryError: string | null;
  // Статусы для чтения
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // Статус для записи (создание/обновление/удаление)
  writeStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  writeError: string | null;
}

const initialState: ServicesState = {
  items: [],
  currentService: null,
  healthHistory: [],
  healthHistoryLoading: false,
  healthHistoryError: null,
  status: 'idle',
  error: null,
  writeStatus: 'idle',
  writeError: null,
};

// ============= ASYNC THUNKS =============

export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await servicesApi.getAll();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch services'
      );
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await servicesApi.getById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch service'
      );
    }
  }
);

export const createService = createAsyncThunk(
  'services/create',
  async (data: ServiceData, { rejectWithValue }) => {
    try {
      return await servicesApi.create(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create service'
      );
    }
  }
);

export const updateService = createAsyncThunk(
  'services/update',
  async (
    { id, data }: { id: string; data: ServiceData },
    { rejectWithValue }
  ) => {
    try {
      return await servicesApi.update(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update service'
      );
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await servicesApi.remove(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete service'
      );
    }
  }
);

export const fetchHealthHistory = createAsyncThunk(
  'services/fetchHealthHistory',
  async (
    { id, startDate, endDate }: { id: string; startDate?: Date; endDate?: Date },
    { rejectWithValue }
  ) => {
    try {
      return await servicesApi.getHealthHistory(id, startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch health history'
      );
    }
  }
);

// ============= SLICE =============

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWriteError: (state) => {
      state.writeError = null;
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    resetWriteStatus: (state) => {
      state.writeStatus = 'idle';
      state.writeError = null;
    },
    clearHealthHistory: (state) => {
      state.healthHistory = [];
      state.healthHistoryError = null;
    },
  },
  extraReducers: (builder) => {
    // ===== FETCH ALL =====
    builder
      .addCase(fetchServices.pending, (state) => {
        if (state.items.length === 0) {
          state.status = 'loading';
        }
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // ===== FETCH BY ID =====
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // ===== CREATE =====
    builder
      .addCase(createService.pending, (state) => {
        state.writeStatus = 'loading';
        state.writeError = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.writeStatus = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.writeStatus = 'failed';
        state.writeError = action.payload as string;
      });

    // ===== UPDATE =====
    builder
      .addCase(updateService.pending, (state) => {
        state.writeStatus = 'loading';
        state.writeError = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.writeStatus = 'succeeded';
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentService?.id === action.payload.id) {
          state.currentService = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.writeStatus = 'failed';
        state.writeError = action.payload as string;
      });

    // ===== DELETE =====
    builder
      .addCase(deleteService.pending, (state) => {
        state.writeStatus = 'loading';
        state.writeError = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.writeStatus = 'succeeded';
        state.items = state.items.filter((s) => s.id !== action.payload);
        if (state.currentService?.id === action.payload) {
          state.currentService = null;
        }
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.writeStatus = 'failed';
        state.writeError = action.payload as string;
      });

    // ===== FETCH HEALTH HISTORY =====
    builder
      .addCase(fetchHealthHistory.pending, (state) => {
        state.healthHistoryLoading = true;
        state.healthHistoryError = null;
      })
      .addCase(fetchHealthHistory.fulfilled, (state, action) => {
        state.healthHistoryLoading = false;
        state.healthHistory = action.payload;
      })
      .addCase(fetchHealthHistory.rejected, (state, action) => {
        state.healthHistoryLoading = false;
        state.healthHistoryError = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearWriteError,
  clearCurrentService,
  clearHealthHistory,
  resetWriteStatus,
} = servicesSlice.actions;

export default servicesSlice.reducer;