import { describe, expect, it, vi } from 'vitest';
import { ListPyrometerSummariesUseCase } from '../../../../core/application/list-pyrometer-summaries.use-case';
import type { PyrometerSummaryDto } from '../../../../core/domain/dtos/pyrometer-summary.dto';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';
import type { IPyrometersClient } from '../../../../interfaces/adapters/clients/i-pyrometers.client';

function clientStub(): IPyrometersClient {
  return {
    listPyrometers: vi.fn<IPyrometersClient['listPyrometers']>(),
    listSummaries: vi.fn<IPyrometersClient['listSummaries']>(),
    saveProfile: vi.fn<IPyrometersClient['saveProfile']>(),
  };
}

const SUMMARY: PyrometerSummaryDto = {
  pyrometerId: 'SN-1',
  temperature: 1510,
  measuredAt: '2026-11-05T10:05:00',
  battery: 62,
  minutesWithoutReading: 3,
};

describe('ListPyrometerSummariesUseCase', () => {
  it('deve devolver exatamente o resumo do client quando a API responde', async () => {
    // Arrange
    const client = clientStub();
    const summaries = [SUMMARY];
    vi.spyOn(client, 'listSummaries').mockResolvedValue(summaries);

    // Act
    const result = await new ListPyrometerSummariesUseCase(client).execute();

    // Assert
    expect(result).toBe(summaries);
  });

  it('deve chamar o client uma vez e sem parametros quando executa', async () => {
    // Arrange
    const client = clientStub();
    const spy = vi.spyOn(client, 'listSummaries').mockResolvedValue([]);

    // Act
    await new ListPyrometerSummariesUseCase(client).execute();

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });

  it('deve propagar o erro quando o client lanca ReadingsUnavailableError', async () => {
    // Arrange
    const client = clientStub();
    const failure = new ReadingsUnavailableError('status HTTP 502');
    vi.spyOn(client, 'listSummaries').mockRejectedValue(failure);

    // Act / Assert
    await expect(new ListPyrometerSummariesUseCase(client).execute()).rejects.toBe(failure);
  });
});
