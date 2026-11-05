import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';
import type { PyrometerProfileDto } from '../../../core/domain/dtos/pyrometer-profile.dto';
import type { PyrometerSummaryDto } from '../../../core/domain/dtos/pyrometer-summary.dto';

export interface IPyrometersClient {
  /** `GET /api/pyrometers`. Lanca `ReadingsUnavailableError` se a API nao responder. */
  listPyrometers(): Promise<PyrometerDto[]>;
  /** `GET /api/pyrometers/summary`. Lanca `ReadingsUnavailableError` se a API nao responder. */
  listSummaries(): Promise<PyrometerSummaryDto[]>;
  /**
   * `PUT /api/pyrometers/{id}`. Lanca `ProfileRejectedError` se a API recusar (404 ou 422) e
   * `ReadingsUnavailableError` se ela nao responder.
   */
  saveProfile(pyrometerId: string, profile: PyrometerProfileDto): Promise<PyrometerDto>;
}
