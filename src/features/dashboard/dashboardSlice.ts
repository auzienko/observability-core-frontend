import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { servicesApi } from '../../api/servicesApi';
import type { MonitoredServiceResponse } from '../../types/service';

interface DashboardState {
  services: MonitoredServiceResponse[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  writeStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  services: [],
  status: 'idle',
  writeStatus: 'idle',
  error: null,
};

export const fetchServices = createAsyncThunk(
  'dashboard/fetchServices',
  async () => {
    const response = await servicesApi.getAll();
    return response.data;
  }
);

export const createService = createAsyncThunk(
  'dashboard/createService',
  async (serviceData: { name: string; pollingIntervalSeconds: number, healthCheckScenario: string }) => {
    const response = await servicesApi.create(serviceData);
    return response.data;
  }
);

export const updateService = createAsyncThunk(
  'dashboard/updateService',
  async (serviceData: { id: string; data: { name: string; pollingIntervalSeconds: number, healthCheckScenario: string } }) => {
    const response = await servicesApi.update(serviceData.id, serviceData.data);
    return response.data;
  }
);

export const deleteService = createAsyncThunk(
  'dashboard/deleteService',
  async (id: string, { dispatch }) => {
    await servicesApi.remove(id);
    dispatch(fetchServices());
    return id;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch services';
      });
    builder
      .addMatcher(
        isAnyOf(createService.pending, updateService.pending, deleteService.pending),
        (state) => { state.writeStatus = 'loading'; }
      )
      .addMatcher(
        isAnyOf(createService.fulfilled, updateService.fulfilled, deleteService.fulfilled),
        (state) => { state.writeStatus = 'succeeded'; }
      )
      .addMatcher(
        isAnyOf(createService.rejected, updateService.rejected, deleteService.rejected),
        (state, action) => {
          state.writeStatus = 'failed';
          state.error = action.error.message || 'Operation failed';
        }
      );
  },
});

export default dashboardSlice.reducer;