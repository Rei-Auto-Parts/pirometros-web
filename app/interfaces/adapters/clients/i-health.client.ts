import type { HealthStatusDto } from '../../../core/domain/dtos/health-status.dto';

export interface IHealthClient {
  /** Consulta `GET /api/health`. Lanca `HealthUnavailableError` se a API nao responder. */
  getHealth(): Promise<HealthStatusDto>;
}
