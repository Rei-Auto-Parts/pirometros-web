import type { HealthStatusDto } from '../../core/domain/dtos/health-status.dto';
import { HealthUnavailableError } from '../../core/domain/errors/health-unavailable.error';
import type { IHealthClient } from '../../interfaces/adapters/clients/i-health.client';
import type { components } from './api-schema';

type HealthResponse = components['schemas']['HealthResponse'];

/** Toda chamada de rede do projeto mora em `adapters/clients/`, nunca dentro de componente. */
export class HealthClient implements IHealthClient {
  constructor(
    private readonly baseUrl: string = '/api',
    private readonly fetcher: typeof fetch = (...args) => fetch(...args),
  ) {}

  async getHealth(): Promise<HealthStatusDto> {
    let response: Response;
    try {
      response = await this.fetcher(`${this.baseUrl}/health`);
    } catch (error) {
      throw new HealthUnavailableError(`falha de rede: ${String(error)}`);
    }
    if (!response.ok) {
      throw new HealthUnavailableError(`status HTTP ${response.status}`);
    }
    const body: HealthResponse = (await response.json()) as HealthResponse;
    return { api: body.api, database: body.database };
  }
}
