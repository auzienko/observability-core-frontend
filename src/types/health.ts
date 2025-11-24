export interface HealthCheckResponse {
  id: string;
  serviceId: string;
  timestamp: string;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  errorMessage: string | null;
}