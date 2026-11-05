import { describe, expect, it, vi } from 'vitest';
import { ReadingsClient } from '../../../../adapters/clients/readings.client';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';

const PERIOD = { start: '2026-01-01T00:00:00', end: '2026-01-02T00:00:00' };

function fetcherReturning(body: unknown, status: number = 200): typeof fetch {
  return vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
}

function calledUrl(fetcher: typeof fetch): URL {
  const url = vi.mocked(fetcher).mock.calls[0]?.[0] as string;
  return new URL(url, 'http://x');
}

const PAGE_BODY = {
  items: [
    {
      id: 7,
      measured_at: '2026-01-01T10:00:00',
      pyrometer_id: 'dev-1',
      pyrometer_name: 'Forno 1',
      temperature: 812.5,
      unit: 'C',
      battery: 90,
      place: 'Fundicao',
    },
    { id: 8 },
  ],
  total: 2,
  page: 1,
  page_size: 25,
};

describe('ReadingsClient.listReadings', () => {
  it('deve chamar GET /api/readings com periodo e paginacao quando nao ha pirometro', async () => {
    // Arrange
    const fetcher = fetcherReturning(PAGE_BODY);
    const query = { period: PERIOD, pyrometerId: null, page: 3, pageSize: 25 };

    // Act
    await new ReadingsClient('/api', fetcher).listReadings(query);

    // Assert
    const url = calledUrl(fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(url.pathname).toBe('/api/readings');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      start: PERIOD.start,
      end: PERIOD.end,
      page: '3',
      page_size: '25',
    });
  });

  it('deve enviar dev_id quando ha pirometro selecionado', async () => {
    // Arrange
    const fetcher = fetcherReturning(PAGE_BODY);
    const query = { period: PERIOD, pyrometerId: 'dev-1', page: 1, pageSize: 25 };

    // Act
    await new ReadingsClient('/api', fetcher).listReadings(query);

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(calledUrl(fetcher).searchParams.get('dev_id')).toBe('dev-1');
  });

  it('deve converter a resposta snake_case para o DTO quando a API responde 200', async () => {
    // Arrange
    const fetcher = fetcherReturning(PAGE_BODY);
    const query = { period: PERIOD, pyrometerId: null, page: 1, pageSize: 25 };

    // Act
    const result = await new ReadingsClient('/api', fetcher).listReadings(query);

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.items[0]).toEqual({
      id: 7,
      measuredAt: '2026-01-01T10:00:00',
      pyrometerId: 'dev-1',
      pyrometerName: 'Forno 1',
      temperature: 812.5,
      unit: 'C',
      battery: 90,
      place: 'Fundicao',
    });
    expect([result.total, result.page, result.pageSize]).toEqual([2, 1, 25]);
  });

  it('deve converter campos ausentes em null quando a leitura vem incompleta', async () => {
    // Arrange
    const fetcher = fetcherReturning(PAGE_BODY);
    const query = { period: PERIOD, pyrometerId: null, page: 1, pageSize: 25 };

    // Act
    const result = await new ReadingsClient('/api', fetcher).listReadings(query);

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.items[1]).toEqual({
      id: 8,
      measuredAt: null,
      pyrometerId: null,
      pyrometerName: null,
      temperature: null,
      unit: null,
      battery: null,
      place: null,
    });
  });

  it('deve lancar indisponibilidade quando a API responde 500', async () => {
    // Arrange
    const fetcher = fetcherReturning({}, 500);
    const query = { period: PERIOD, pyrometerId: null, page: 1, pageSize: 25 };

    // Act / Assert
    await expect(new ReadingsClient('/api', fetcher).listReadings(query)).rejects.toThrow(
      new ReadingsUnavailableError('status HTTP 500'),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('deve lancar indisponibilidade quando a rede falha', async () => {
    // Arrange
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    const query = { period: PERIOD, pyrometerId: null, page: 1, pageSize: 25 };

    // Act / Assert
    await expect(new ReadingsClient('/api', fetcher).listReadings(query)).rejects.toBeInstanceOf(
      ReadingsUnavailableError,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('deve usar /api e o fetch global quando nenhum parametro e informado', async () => {
    // Arrange
    const globalFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(PAGE_BODY), { status: 200 }));
    const query = { period: PERIOD, pyrometerId: null, page: 1, pageSize: 25 };

    // Act
    await new ReadingsClient().listReadings(query);

    // Assert
    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch.mock.calls[0]?.[0]).toMatch(/^\/api\/readings\?/);
    globalFetch.mockRestore();
  });
});

const SERIES_BODY = [
  {
    pyrometer_id: 'dev-1',
    pyrometer_name: 'Forno 1',
    points: [
      { measured_at: '2026-01-01T10:00:00', temperature: 800 },
      { measured_at: null, temperature: 801 },
      { measured_at: '2026-01-01T10:02:00', temperature: null },
      { measured_at: '2026-01-01T10:03:00', temperature: 0 },
    ],
  },
  { points: [] },
];

describe('ReadingsClient.getSeries', () => {
  it('deve chamar GET /api/readings/series apenas com periodo quando nao ha pirometro', async () => {
    // Arrange
    const fetcher = fetcherReturning(SERIES_BODY);

    // Act
    await new ReadingsClient('/api', fetcher).getSeries(PERIOD, null);

    // Assert
    const url = calledUrl(fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(url.pathname).toBe('/api/readings/series');
    expect(Object.fromEntries(url.searchParams)).toEqual({ start: PERIOD.start, end: PERIOD.end });
  });

  it('deve enviar dev_id quando ha pirometro selecionado', async () => {
    // Arrange
    const fetcher = fetcherReturning(SERIES_BODY);

    // Act
    await new ReadingsClient('/api', fetcher).getSeries(PERIOD, 'dev-1');

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(calledUrl(fetcher).searchParams.get('dev_id')).toBe('dev-1');
  });

  it('deve converter a serie e descartar pontos com temperatura ou data nulas', async () => {
    // Arrange
    const fetcher = fetcherReturning(SERIES_BODY);

    // Act
    const result = await new ReadingsClient('/api', fetcher).getSeries(PERIOD, null);

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result[0]).toEqual({
      pyrometerId: 'dev-1',
      pyrometerName: 'Forno 1',
      points: [
        { measuredAt: '2026-01-01T10:00:00', temperature: 800 },
        { measuredAt: '2026-01-01T10:03:00', temperature: 0 },
      ],
    });
  });

  it('deve converter identificacao ausente em null quando a serie vem sem pirometro', async () => {
    // Arrange
    const fetcher = fetcherReturning(SERIES_BODY);

    // Act
    const result = await new ReadingsClient('/api', fetcher).getSeries(PERIOD, null);

    // Assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result[1]).toEqual({ pyrometerId: null, pyrometerName: null, points: [] });
  });

  it('deve lancar indisponibilidade quando a API responde 500', async () => {
    // Arrange
    const fetcher = fetcherReturning({}, 500);

    // Act / Assert
    await expect(new ReadingsClient('/api', fetcher).getSeries(PERIOD, null)).rejects.toThrow(
      new ReadingsUnavailableError('status HTTP 500'),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('deve lancar indisponibilidade quando a rede falha', async () => {
    // Arrange
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

    // Act / Assert
    await expect(
      new ReadingsClient('/api', fetcher).getSeries(PERIOD, null),
    ).rejects.toBeInstanceOf(ReadingsUnavailableError);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
