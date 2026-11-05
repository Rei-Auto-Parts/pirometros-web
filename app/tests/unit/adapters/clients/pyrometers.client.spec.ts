import { describe, expect, it, vi } from 'vitest';
import { PyrometersClient } from '../../../../adapters/clients/pyrometers.client';
import { ProfileRejectedError } from '../../../../core/domain/errors/profile-rejected.error';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';

function fetcherReturning(response: Response): typeof fetch {
  return vi.fn<typeof fetch>(async () => response);
}

const ITEM = {
  id: 'SN-1',
  name: 'PI-12',
  nickname: 'Forno 2',
  color: '#e11d48',
  note: 'termopar trocado',
  active: false,
};
const PROFILE = { nickname: 'Forno 2', color: '#e11d48', note: null, active: true };

describe('PyrometersClient.listPyrometers', () => {
  it('deve converter o complemento quando a API devolve todos os campos', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response(JSON.stringify([ITEM]), { status: 200 }));

    // Act
    const result = await new PyrometersClient('/api', fetcher).listPyrometers();

    // Assert
    expect(result).toEqual([ITEM]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/pyrometers');
  });

  it('deve converter campos nulos ou ausentes em nulo quando o pirometro nao tem complemento', async () => {
    // Arrange
    const body = JSON.stringify([{ id: 'SN-2', color: '#2563eb', active: true }]);
    const fetcher = fetcherReturning(new Response(body, { status: 200 }));

    // Act
    const result = await new PyrometersClient('/api', fetcher).listPyrometers();

    // Assert
    expect(result).toEqual([
      { id: 'SN-2', name: null, nickname: null, color: '#2563eb', note: null, active: true },
    ]);
  });

  it('deve devolver lista vazia quando a API responde sem pirometros', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response('[]', { status: 200 }));

    // Act
    const result = await new PyrometersClient('/api', fetcher).listPyrometers();

    // Assert
    expect(result).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/pyrometers');
  });

  it('deve usar a base informada quando o endereco e passado ao construtor', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response('[]', { status: 200 }));

    // Act
    await new PyrometersClient('http://api/api', fetcher).listPyrometers();

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('http://api/api/pyrometers');
  });

  it('deve usar /api e o fetch global quando nenhum parametro e informado', async () => {
    // Arrange
    const globalFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('[]', { status: 200 }));

    // Act
    const result = await new PyrometersClient().listPyrometers();

    // Assert
    expect(result).toEqual([]);
    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch).toHaveBeenCalledWith('/api/pyrometers');
  });

  it('deve lancar indisponibilidade com o status quando a API responde 503', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response('', { status: 503 }));

    // Act / Assert
    await expect(new PyrometersClient('/api', fetcher).listPyrometers()).rejects.toThrow(
      new ReadingsUnavailableError('status HTTP 503'),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/pyrometers');
  });

  it('deve lancar indisponibilidade quando a rede falha', async () => {
    // Arrange
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

    // Act / Assert
    await expect(new PyrometersClient('/api', fetcher).listPyrometers()).rejects.toBeInstanceOf(
      ReadingsUnavailableError,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/pyrometers');
  });
});

describe('PyrometersClient.listSummaries', () => {
  it('deve converter o resumo quando a API responde 200', async () => {
    // Arrange
    const body = JSON.stringify([
      {
        pyrometer_id: 'SN-1',
        temperature: 1510,
        measured_at: '2026-11-05T10:05:00',
        battery: 62,
        minutes_without_reading: 3,
      },
      {
        pyrometer_id: 'SN-2',
        temperature: 1400,
        measured_at: '2026-11-05T10:00:00',
        minutes_without_reading: 8,
      },
    ]);
    const fetcher = fetcherReturning(new Response(body, { status: 200 }));

    // Act
    const result = await new PyrometersClient('/api', fetcher).listSummaries();

    // Assert
    expect(result).toEqual([
      {
        pyrometerId: 'SN-1',
        temperature: 1510,
        measuredAt: '2026-11-05T10:05:00',
        battery: 62,
        minutesWithoutReading: 3,
      },
      {
        pyrometerId: 'SN-2',
        temperature: 1400,
        measuredAt: '2026-11-05T10:00:00',
        battery: null,
        minutesWithoutReading: 8,
      },
    ]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/pyrometers/summary');
  });

  it('deve lancar indisponibilidade quando a API responde 500', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response('', { status: 500 }));

    // Act / Assert
    await expect(new PyrometersClient('/api', fetcher).listSummaries()).rejects.toThrow(
      new ReadingsUnavailableError('status HTTP 500'),
    );
  });
});

describe('PyrometersClient.saveProfile', () => {
  it('deve enviar PUT com o complemento em JSON quando salva', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response(JSON.stringify(ITEM), { status: 200 }));

    // Act
    await new PyrometersClient('/api', fetcher).saveProfile('SN-1', PROFILE);

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/pyrometers/SN-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PROFILE),
    });
  });

  it('deve devolver o pirometro atualizado quando a API responde 200', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response(JSON.stringify(ITEM), { status: 200 }));

    // Act
    const result = await new PyrometersClient('/api', fetcher).saveProfile('SN-1', PROFILE);

    // Assert
    expect(result).toEqual(ITEM);
  });

  it('deve codificar o serial na URL quando ele tem caracteres especiais', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response(JSON.stringify(ITEM), { status: 200 }));

    // Act
    await new PyrometersClient('/api', fetcher).saveProfile('A/B C', PROFILE);

    // Assert
    expect(fetcher).toHaveBeenCalledWith('/api/pyrometers/A%2FB%20C', expect.any(Object));
  });

  it.each([404, 409, 422])(
    'deve lancar ProfileRejectedError quando a API responde %i',
    async (status) => {
      // Arrange
      const fetcher = fetcherReturning(new Response('{}', { status }));

      // Act / Assert
      await expect(
        new PyrometersClient('/api', fetcher).saveProfile('SN-1', PROFILE),
      ).rejects.toThrow(new ProfileRejectedError(status));
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );

  it('deve lancar indisponibilidade quando a API responde 503', async () => {
    // Arrange
    const fetcher = fetcherReturning(new Response('', { status: 503 }));

    // Act / Assert
    await expect(
      new PyrometersClient('/api', fetcher).saveProfile('SN-1', PROFILE),
    ).rejects.toThrow(new ReadingsUnavailableError('status HTTP 503'));
  });

  it('deve lancar indisponibilidade quando a rede falha', async () => {
    // Arrange
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

    // Act / Assert
    await expect(
      new PyrometersClient('/api', fetcher).saveProfile('SN-1', PROFILE),
    ).rejects.toBeInstanceOf(ReadingsUnavailableError);
  });
});
