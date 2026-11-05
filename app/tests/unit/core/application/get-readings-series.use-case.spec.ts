import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GetReadingsSeriesUseCase } from '../../../../core/application/get-readings-series.use-case';
import type { PyrometerSeriesDto } from '../../../../core/domain/dtos/pyrometer-series.dto';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';
import type { IReadingsClient } from '../../../../interfaces/adapters/clients/i-readings.client';

const TODAY = { start: '2026-11-03T00:00:00', end: '2026-11-03T23:59:59' };

function clientStub(): IReadingsClient {
  return {
    listReadings: vi.fn<IReadingsClient['listReadings']>(),
    getSeries: vi.fn<IReadingsClient['getSeries']>(),
  };
}

describe('GetReadingsSeriesUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 9, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve consultar o dia de hoje sem pirometro quando nenhum pirometro e informado', async () => {
    // Arrange
    const client = clientStub();
    const series: PyrometerSeriesDto[] = [];
    vi.spyOn(client, 'getSeries').mockResolvedValue(series);

    // Act
    const result = await new GetReadingsSeriesUseCase(client).execute(null);

    // Assert
    expect(client.getSeries).toHaveBeenCalledTimes(1);
    expect(client.getSeries).toHaveBeenCalledWith(TODAY, null);
    expect(client.getSeries).toHaveReturnedWith(expect.any(Promise));
    expect(result).toBe(series);
  });

  it('deve repassar o serial do pirometro quando ele e informado', async () => {
    // Arrange
    const client = clientStub();
    const series: PyrometerSeriesDto[] = [];
    vi.spyOn(client, 'getSeries').mockResolvedValue(series);

    // Act
    const result = await new GetReadingsSeriesUseCase(client).execute('PIR-001');

    // Assert
    expect(client.getSeries).toHaveBeenCalledTimes(1);
    expect(client.getSeries).toHaveBeenCalledWith(TODAY, 'PIR-001');
    expect(result).toBe(series);
  });

  it('deve devolver exatamente a serie do client quando a API responde', async () => {
    // Arrange
    const client = clientStub();
    const series: PyrometerSeriesDto[] = [
      {
        pyrometerId: 'PIR-001',
        pyrometerName: 'Forno 1',
        points: [{ measuredAt: '2026-11-03T08:00:00', temperature: 701.5 }],
      },
    ];
    vi.spyOn(client, 'getSeries').mockResolvedValue(series);

    // Act
    const result = await new GetReadingsSeriesUseCase(client).execute(null);

    // Assert
    expect(result).toBe(series);
    expect(client.getSeries).toHaveBeenCalledTimes(1);
    expect(client.getSeries).toHaveBeenCalledWith(TODAY, null);
  });

  it('deve propagar o erro quando o client lanca ReadingsUnavailableError', async () => {
    // Arrange
    const client = clientStub();
    const failure = new ReadingsUnavailableError('status HTTP 502');
    vi.spyOn(client, 'getSeries').mockRejectedValue(failure);

    // Act / Assert
    await expect(new GetReadingsSeriesUseCase(client).execute(null)).rejects.toBe(failure);
    expect(client.getSeries).toHaveBeenCalledTimes(1);
    expect(client.getSeries).toHaveBeenCalledWith(TODAY, null);
  });

  it('deve consultar a ultima hora ate agora quando o periodo e hour', async () => {
    // Arrange
    const client = clientStub();
    const spy = vi.spyOn(client, 'getSeries').mockResolvedValue([]);

    // Act
    await new GetReadingsSeriesUseCase(client).execute(null, 'hour');

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      { start: '2026-11-03T08:00:00', end: '2026-11-03T09:00:00' },
      null,
    );
  });

  it('deve consultar os tres dias ate agora quando o periodo e threeDays', async () => {
    // Arrange
    const client = clientStub();
    const spy = vi.spyOn(client, 'getSeries').mockResolvedValue([]);

    // Act
    await new GetReadingsSeriesUseCase(client).execute('PIR-001', 'threeDays');

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      { start: '2026-10-31T09:00:00', end: '2026-11-03T09:00:00' },
      'PIR-001',
    );
  });

  it('deve consultar o dia de hoje quando o periodo e today', async () => {
    // Arrange
    const client = clientStub();
    const spy = vi.spyOn(client, 'getSeries').mockResolvedValue([]);

    // Act
    await new GetReadingsSeriesUseCase(client).execute(null, 'today');

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(TODAY, null);
  });
});
