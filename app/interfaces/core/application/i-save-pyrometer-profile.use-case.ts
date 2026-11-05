import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerProfileDto } from '../../../core/domain/dtos/pyrometer-profile.dto';

export interface ISavePyrometerProfileUseCase {
  /** Grava o complemento de um pirometro existente e devolve o pirometro ja atualizado. */
  execute(pyrometerId: string, profile: PyrometerProfileDto): Promise<PyrometerDto>;
}
