import type { PyrometerSummaryDto } from '../../../core/domain/dtos/pyrometer-summary.dto';

export interface IListPyrometerSummariesUseCase {
  /** Ultima leitura com temperatura de cada pirometro e ha quantos minutos ela foi feita. */
  execute(): Promise<PyrometerSummaryDto[]>;
}
