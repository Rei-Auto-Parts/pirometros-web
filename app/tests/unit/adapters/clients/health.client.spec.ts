import { describe, expect, it, vi } from 'vitest';
import { HealthClient } from '../../../../adapters/clients/health.client';
import { HealthUnavailableError } from '../../../../core/domain/errors/health-unavailable.error';

function fetcherReturning(response: Response): typeof fetch {
  return vi.fn<typeof fetch>(async () => response);
}

describe('HealthClient', () => {
  it('deve devolver o estado quando a API responde 200', async () => {
    // Arrange
    const body = JSON.stringify({ api: 'up', database: 'down' });
    const fetcher = fetcherReturning(new Response(body, { status: 200 }));

    // Act
    const result = await new HealthClient('http://api/api', fetcher).getHealth();

    // Assert
    expect(result).toEqual({ api: 'up', database: 'down' });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('http://api/api/health');
  });

  it('deve lancar indisponibilidade com o status quando a API responde erro HTTP', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response('', { status: 502 }));

    // Act / Assert
    await expect(new HealthClient('/api', fetcher).getHealth()).rejects.toThrow(
      new HealthUnavailableError('status HTTP 502'),
    );
  });

  it('deve lancar indisponibilidade quando a rede falha', async () => {
    // Arrange
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

    // Act / Assert
    await expect(new HealthClient('/api', fetcher).getHealth()).rejects.toBeInstanceOf(
      HealthUnavailableError,
    );
  });

  it('deve usar /api e o fetch global quando nenhum parametro e informado', async () => {
    // Arrange
    const body = JSON.stringify({ api: 'up', database: 'up' });
    const globalFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(body, { status: 200 }));

    // Act
    await new HealthClient().getHealth();

    // Assert
    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch).toHaveBeenCalledWith('/api/health');
  });
});
