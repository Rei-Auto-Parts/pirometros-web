import type { IHealthClient } from '../../interfaces/adapters/clients/i-health.client';
import type { IGetHealthUseCase } from '../../interfaces/core/application/i-get-health.use-case';
import type { HealthStatusDto } from '../domain/dtos/health-status.dto';
import { HealthUnavailableError } from '../domain/errors/health-unavailable.error';

export class GetHealthUseCase implements IGetHealthUseCase {
  constructor(private readonly healthClient: IHealthClient) {}

  /** Com a API fora do ar nao ha como saber do banco: o estado dele fica `unknown`. */
  async execute(): Promise<HealthStatusDto> {
    try {
      return await this.healthClient.getHealth();
    } catch (error) {
      if (error instanceof HealthUnavailableError) {
        return { api: 'down', database: 'unknown' };
      }
      throw error;
    }
  }
}
