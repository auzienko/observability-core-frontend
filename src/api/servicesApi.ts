// src/api/servicesApi.ts
import apiClient from './apiClient';
import type { MonitoredServiceResponse } from '../types/service';
import type { HealthCheckResponse } from '../types/health';

export type ServiceData = {
  name: string;
  healthCheckScenario: string;
  pollingIntervalSeconds: number;
};

export const servicesApi = {
  // GET /api/observability-api/services
  getAll: async (): Promise<MonitoredServiceResponse[]> => {
    const response = await apiClient.get<MonitoredServiceResponse[]>(
      '/observability-api/services'
    );
    return response.data;
  },

  // GET /api/observability-api/services/:id
  getById: async (id: string): Promise<MonitoredServiceResponse> => {
    const response = await apiClient.get<MonitoredServiceResponse>(
      `/observability-api/services/${id}`
    );
    return response.data;
  },

  // POST /api/observability-api/services
  create: async (data: ServiceData): Promise<MonitoredServiceResponse> => {
    const response = await apiClient.post<MonitoredServiceResponse>(
      '/observability-api/services',
      data
    );
    return response.data;
  },

  // PUT /api/observability-api/services/:id
  update: async (id: string, data: ServiceData): Promise<MonitoredServiceResponse> => {
    const response = await apiClient.put<MonitoredServiceResponse>(
      `/observability-api/services/${id}`,
      data
    );
    return response.data;
  },

  // DELETE /api/observability-api/services/:id
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/observability-api/services/${id}`);
  },

  // GET /api/observability-api/services/:id/health-history
  getHealthHistory: async (
    id: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<HealthCheckResponse[]> => {
    const params: Record<string, string> = {};
    
    if (startDate) {
      params.startDate = startDate.toISOString();
    }
    if (endDate) {
      params.endDate = endDate.toISOString();
    }

    const response = await apiClient.get<HealthCheckResponse[]>(
      `/observability-api/services/${id}/health-history`,
      { params }
    );
    return response.data;
  },
};