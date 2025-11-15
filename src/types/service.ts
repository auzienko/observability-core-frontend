export interface MonitoredServiceResponse {
  id: string;
  name: string;
  healthCheckScenario: string;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  lastCheckedAt: string | null;
}