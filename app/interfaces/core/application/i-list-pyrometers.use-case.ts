import type { PyrometerDto } from '../../../core/domain/dtos/pyrometer.dto';

export interface IListPyrometersUseCase {
  execute(): Promise<PyrometerDto[]>;
}
