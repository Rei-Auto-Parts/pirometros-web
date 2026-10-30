export type ServiceState = 'up' | 'down' | 'unknown';

export interface HealthStatusDto {
  readonly api: ServiceState;
  readonly database: ServiceState;
}
