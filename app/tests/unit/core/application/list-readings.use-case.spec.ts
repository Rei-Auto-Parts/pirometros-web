import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ListReadingsUseCase } from '../../../../core/application/list-readings.use-case';
import { READINGS_PAGE_SIZE } from '../../../../core/domain/constants/readings.constants';
import type { ReadingDto } from '../../../../core/domain/dtos/reading.dto';
import type { ReadingsPageDto } from '../../../../core/domain/dtos/readings-page.dto';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';
import type { IReadingsClient } from '../../../../interfaces/adapters/clients/i-readings.client';

function clientStub(): IReadingsClient {
  return {
    listReadings: vi.fn<IReadingsClient['listReadings']>(),
    getSeries: vi.fn<IReadingsClient['getSeries']>(),
  };
}

function readingOf(id: number, temperature: number | null): ReadingDto {
  return {
    id,
    measuredAt: '2026-10-29T10:00:00',
    pyrometerId: 'P1',
    pyrometerName: 'Forno 1',
    temperature,
    unit: 'C',
    battery: 80,
    place: 1,
  };
}

function pageOf(items: readonly ReadingDto[]): ReadingsPageDto {
  return { items, total: 7, page: 2, pageSize: READINGS_PAGE_SIZE };
}

const EXPLICIT_PERIOD = { start: '2026-10-29T00:00', end: '2026-10-29T23:59' };

describe('ListReadingsUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 9, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve consultar o dia de hoje quando o periodo e nulo', async () => {
    // Arrange
    const client = clientStub();
    const page = pageOf([readingOf(1, 900)]);
    vi.spyOn(client, 'listReadings').mockResolvedValue(page);

    // Act
    const result = await new ListReadingsUseCase(client).execute({
      period: null,
      pyrometerId: null,
      page: 1,
    });

    // Assert
    expect(client.listReadings).toHaveBeenCalledTimes(1);
    expect(client.listReadings).toHaveBeenCalledWith({
      period: { start: '2026-11-03T00:00:00', end: '2026-11-03T23:59:59' },
      pyrometerId: null,
      page: 1,
      pageSize: READINGS_PAGE_SIZE,
    });
    expect(result).toEqual(page);
  });

  it('deve consultar o periodo completado em segundos quando o periodo e explicito', async () => {
    // Arrange
    const client = clientStub();
    const page = pageOf([readingOf(1, 900)]);
    vi.spyOn(client, 'listReadings').mockResolvedValue(page);

    // Act
    const result = await new ListReadingsUseCase(client).execute({
      period: EXPLICIT_PERIOD,
      pyrometerId: null,
      page: 1,
    });

    // Assert
    expect(client.listReadings).toHaveBeenCalledTimes(1);
    expect(client.listReadings).toHaveBeenCalledWith({
      period: { start: '2026-10-29T00:00:00', end: '2026-10-29T23:59:59' },
      pyrometerId: null,
      page: 1,
      pageSize: READINGS_PAGE_SIZE,
    });
    expect(result).toEqual(page);
  });

  it('deve repassar pirometro, pagina e tamanho de pagina quando informados', async () => {
    // Arrange
    const client = clientStub();
    const page = pageOf([readingOf(1, 900)]);
    vi.spyOn(client, 'listReadings').mockResolvedValue(page);

    // Act
    const result = await new ListReadingsUseCase(client).execute({
      period: EXPLICIT_PERIOD,
      pyrometerId: 'P7',
      page: 3,
    });

    // Assert
    expect(client.listReadings).toHaveBeenCalledTimes(1);
    expect(client.listReadings).toHaveBeenCalledWith({
      period: { start: '2026-10-29T00:00:00', end: '2026-10-29T23:59:59' },
      pyrometerId: 'P7',
      page: 3,
      pageSize: 50,
    });
    expect(result).toEqual(page);
  });

  it('deve descartar leituras sem temperatura e manter a paginacao quando a pagina as traz', async () => {
    // Arrange
    const client = clientStub();
    const first = readingOf(1, 900);
    const last = readingOf(3, 0);
    const page = pageOf([first, readingOf(2, null), last]);
    vi.spyOn(client, 'listReadings').mockResolvedValue(page);

    // Act
    const result = await new ListReadingsUseCase(client).execute({
      period: EXPLICIT_PERIOD,
      pyrometerId: null,
      page: 2,
    });

    // Assert
    expect(client.listReadings).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      items: [first, last],
      total: 7,
      page: 2,
      pageSize: READINGS_PAGE_SIZE,
    });
  });

  it('deve propagar o erro quando o client informa leituras indisponiveis', async () => {
    // Arrange
    const client = clientStub();
    const failure = new ReadingsUnavailableError('status HTTP 502');
    vi.spyOn(client, 'listReadings').mockRejectedValue(failure);

    // Act / Assert
    await expect(
      new ListReadingsUseCase(client).execute({ period: null, pyrometerId: null, page: 1 }),
    ).rejects.toBe(failure);
    expect(client.listReadings).toHaveBeenCalledTimes(1);
  });
});
