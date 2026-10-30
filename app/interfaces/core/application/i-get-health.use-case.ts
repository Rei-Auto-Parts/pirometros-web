import type { HealthStatusDto } from '../../../core/domain/dtos/health-status.dto';

export interface IGetHealthUseCase {
  execute(): Promise<HealthStatusDto>;
}
