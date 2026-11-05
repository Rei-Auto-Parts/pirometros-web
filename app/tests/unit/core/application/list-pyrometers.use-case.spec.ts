import { describe, expect, it, vi } from 'vitest';
import { ListPyrometersUseCase } from '../../../../core/application/list-pyrometers.use-case';
import type { PyrometerDto } from '../../../../core/domain/dtos/pyrometer.dto';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';
import type { IPyrometersClient } from '../../../../interfaces/adapters/clients/i-pyrometers.client';

function build(id: string, name: string | null): PyrometerDto {
  return { id, name, nickname: null, color: '#2563eb', note: null, active: true };
}

function clientStub(): IPyrometersClient {
  return {
    listPyrometers: vi.fn<IPyrometersClient['listPyrometers']>(),
    listSummaries: vi.fn<IPyrometersClient['listSummaries']>(),
    saveProfile: vi.fn<IPyrometersClient['saveProfile']>(),
  };
}

describe('ListPyrometersUseCase', () => {
  it('deve devolver a lista do client quando ha pirometros, inclusive sem nome', async () => {
    // Arrange
    const client = clientStub();
    const pyrometers: PyrometerDto[] = [build('p1', 'Forno 1'), build('p2', null)];
    vi.spyOn(client, 'listPyrometers').mockResolvedValue(pyrometers);

    // Act
    const result = await new ListPyrometersUseCase(client).execute();

    // Assert
    expect(result).toEqual(pyrometers);
  });

  it('deve chamar o client uma vez e sem parametros quando executa', async () => {
    // Arrange
    const client = clientStub();
    const pyrometers: PyrometerDto[] = [build('p1', 'Forno 1')];
    const spy = vi.spyOn(client, 'listPyrometers').mockResolvedValue(pyrometers);

    // Act
    const result = await new ListPyrometersUseCase(client).execute();

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
    await expect(spy.mock.results[0]?.value).resolves.toBe(pyrometers);
    expect(result).toBe(pyrometers);
  });

  it('deve devolver lista vazia quando o client nao tem pirometros', async () => {
    // Arrange
    const client = clientStub();
    vi.spyOn(client, 'listPyrometers').mockResolvedValue([]);

    // Act
    const result = await new ListPyrometersUseCase(client).execute();

    // Assert
    expect(result).toEqual([]);
  });

  it('deve propagar o erro quando as leituras estao indisponiveis', async () => {
    // Arrange
    const client = clientStub();
    const failure = new ReadingsUnavailableError('status HTTP 502');
    vi.spyOn(client, 'listPyrometers').mockRejectedValue(failure);

    // Act / Assert
    await expect(new ListPyrometersUseCase(client).execute()).rejects.toBe(failure);
    expect(client.listPyrometers).toHaveBeenCalledTimes(1);
    expect(client.listPyrometers).toHaveBeenCalledWith();
  });
});
