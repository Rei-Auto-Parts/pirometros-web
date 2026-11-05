import type { IPyrometersClient } from '../../interfaces/adapters/clients/i-pyrometers.client';
import type { ISavePyrometerProfileUseCase } from '../../interfaces/core/application/i-save-pyrometer-profile.use-case';
import type { PyrometerDto } from '../domain/dtos/pyrometer.dto';
import type { PyrometerProfileDto } from '../domain/dtos/pyrometer-profile.dto';

/** So complementa pirometro que ja existe: a API recusa serial desconhecido. */
export class SavePyrometerProfileUseCase implements ISavePyrometerProfileUseCase {
  constructor(private readonly pyrometersClient: IPyrometersClient) {}

  async execute(pyrometerId: string, profile: PyrometerProfileDto): Promise<PyrometerDto> {
    return this.pyrometersClient.saveProfile(pyrometerId, profile);
  }
}
