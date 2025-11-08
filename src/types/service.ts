export interface MonitoredServiceResponse {
  id: string;
  name: string;
  healthCheckScenario: string;
  pollingIntervalSeconds: number;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  lastCheckedAt: string;
  avgResponseTimeMs: number | null;
}