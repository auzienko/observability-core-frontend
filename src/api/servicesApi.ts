import apiClient from './apiClient';
import type { MonitoredServiceResponse } from '../types/service';

type ServiceData = {
    name: string;
    healthCheckScenario: string;
    pollingIntervalSeconds: number;
};

export const servicesApi = {
    getAll: () => {
        return apiClient.get<MonitoredServiceResponse[]>('/observability-api/dashboard/status');
    },

    create: (data: ServiceData) => {
        return apiClient.post<MonitoredServiceResponse>('/observability-api/services', data);
    },

    update: (id: string, data: ServiceData) => {
        return apiClient.put<MonitoredServiceResponse>(`/observability-api/services/${id}`, data);
    },

    remove: (id: string) => {
        return apiClient.delete(`/services/${id}`);
    },
};