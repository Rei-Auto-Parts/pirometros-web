import { describe, expect, it, vi } from 'vitest';
import { GetHealthUseCase } from '../../../../core/application/get-health.use-case';
import type { HealthStatusDto } from '../../../../core/domain/dtos/health-status.dto';
import { HealthUnavailableError } from '../../../../core/domain/errors/health-unavailable.error';
import type { IHealthClient } from '../../../../interfaces/adapters/clients/i-health.client';

function clientStub(): IHealthClient {
  return { getHealth: vi.fn<IHealthClient['getHealth']>() };
}

describe('GetHealthUseCase', () => {
  it('deve devolver o estado informado pelo client quando a API responde', async () => {
    // Arrange
    const client = clientStub();
    const status: HealthStatusDto = { api: 'up', database: 'down' };
    vi.spyOn(client, 'getHealth').mockResolvedValue(status);

    // Act
    const result = await new GetHealthUseCase(client).execute();

    // Assert
    expect(result).toEqual(status);
    expect(client.getHealth).toHaveBeenCalledTimes(1);
    expect(client.getHealth).toHaveBeenCalledWith();
  });

  it('deve marcar a API fora do ar e o banco indeterminado quando a API esta indisponivel', async () => {
    // Arrange
    const client = clientStub();
    vi.spyOn(client, 'getHealth').mockRejectedValue(new HealthUnavailableError('status HTTP 502'));

    // Act
    const result = await new GetHealthUseCase(client).execute();

    // Assert
    expect(result).toEqual({ api: 'down', database: 'unknown' });
  });

  it('deve propagar o erro quando a falha nao e de indisponibilidade', async () => {
    // Arrange
    const client = clientStub();
    const failure = new TypeError('bug inesperado');
    vi.spyOn(client, 'getHealth').mockRejectedValue(failure);

    // Act / Assert
    await expect(new GetHealthUseCase(client).execute()).rejects.toBe(failure);
  });
});
