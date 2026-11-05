// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ReadingsClient } from '../../../../adapters/clients/readings.client';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';
import { WIREMOCK } from '../../support/wiremock';

const PERIOD = { start: '2026-05-01T00:00:00', end: '2026-05-01T23:59:59' };

describe('ReadingsClient contra o WireMock', () => {
  it('deve devolver a página de leituras quando a API simulada responde 200', async () => {
    // Arrange
    const client = new ReadingsClient(`${WIREMOCK}/api`);

    // Act
    const result = await client.listReadings({
      period: PERIOD,
      pyrometerId: null,
      page: 1,
      pageSize: 50,
    });

    // Assert
    expect(result.total).toBe(2);
    expect(result.items[0]).toEqual({
      id: 1,
      measuredAt: '2026-05-01T08:00:00',
      pyrometerId: 'SN-001',
      pyrometerName: 'Forno 1',
      temperature: 700.5,
      unit: 'C',
      battery: 80,
      place: 1,
    });
    expect(result.items[1]?.pyrometerName).toBeNull();
  });

  it('deve devolver a série sem os pontos sem temperatura quando a API simulada responde 200', async () => {
    // Arrange
    const client = new ReadingsClient(`${WIREMOCK}/api`);

    // Act
    const result = await client.getSeries(PERIOD, null);

    // Assert
    expect(result).toEqual([
      {
        pyrometerId: 'SN-001',
        pyrometerName: 'Forno 1',
        points: [{ measuredAt: '2026-05-01T08:00:00', temperature: 700.5 }],
      },
    ]);
  });

  it('deve lançar indisponibilidade quando a API simulada responde 503', async () => {
    // Arrange
    const client = new ReadingsClient(`${WIREMOCK}/api`);

    // Act / Assert
    await expect(
      client.listReadings({ period: PERIOD, pyrometerId: 'OFFLINE', page: 1, pageSize: 50 }),
    ).rejects.toBeInstanceOf(ReadingsUnavailableError);
  });
});
