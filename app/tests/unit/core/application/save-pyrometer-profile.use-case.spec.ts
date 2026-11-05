import { describe, expect, it, vi } from 'vitest';
import { SavePyrometerProfileUseCase } from '../../../../core/application/save-pyrometer-profile.use-case';
import type { PyrometerDto } from '../../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerProfileDto } from '../../../../core/domain/dtos/pyrometer-profile.dto';
import { ProfileRejectedError } from '../../../../core/domain/errors/profile-rejected.error';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';
import type { IPyrometersClient } from '../../../../interfaces/adapters/clients/i-pyrometers.client';

function clientStub(): IPyrometersClient {
  return {
    listPyrometers: vi.fn<IPyrometersClient['listPyrometers']>(),
    listSummaries: vi.fn<IPyrometersClient['listSummaries']>(),
    saveProfile: vi.fn<IPyrometersClient['saveProfile']>(),
  };
}

const PROFILE: PyrometerProfileDto = {
  nickname: 'Forno 2',
  color: '#e11d48',
  note: 'termopar trocado',
  active: true,
};
const SAVED: PyrometerDto = {
  id: 'SN-1',
  name: 'PI-12',
  nickname: 'Forno 2',
  color: '#e11d48',
  note: 'termopar trocado',
  active: true,
};

describe('SavePyrometerProfileUseCase', () => {
  it('deve repassar o serial e o complemento ao client quando executa', async () => {
    // Arrange
    const client = clientStub();
    const spy = vi.spyOn(client, 'saveProfile').mockResolvedValue(SAVED);

    // Act
    await new SavePyrometerProfileUseCase(client).execute('SN-1', PROFILE);

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('SN-1', PROFILE);
  });

  it('deve devolver o pirometro atualizado que o client devolve', async () => {
    // Arrange
    const client = clientStub();
    vi.spyOn(client, 'saveProfile').mockResolvedValue(SAVED);

    // Act
    const result = await new SavePyrometerProfileUseCase(client).execute('SN-1', PROFILE);

    // Assert
    expect(result).toBe(SAVED);
  });

  it('deve propagar ProfileRejectedError quando a API recusa o complemento', async () => {
    // Arrange
    const client = clientStub();
    const failure = new ProfileRejectedError(422);
    vi.spyOn(client, 'saveProfile').mockRejectedValue(failure);

    // Act / Assert
    await expect(new SavePyrometerProfileUseCase(client).execute('SN-1', PROFILE)).rejects.toBe(
      failure,
    );
  });

  it('deve propagar ReadingsUnavailableError quando a API nao responde', async () => {
    // Arrange
    const client = clientStub();
    const failure = new ReadingsUnavailableError('falha de rede');
    vi.spyOn(client, 'saveProfile').mockRejectedValue(failure);

    // Act / Assert
    await expect(new SavePyrometerProfileUseCase(client).execute('SN-1', PROFILE)).rejects.toBe(
      failure,
    );
  });
});
