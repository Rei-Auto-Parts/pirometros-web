import type { IPyrometersClient } from '../../interfaces/adapters/clients/i-pyrometers.client';
import type { IListPyrometersUseCase } from '../../interfaces/core/application/i-list-pyrometers.use-case';
import type { PyrometerDto } from '../domain/dtos/pyrometer.dto';

export class ListPyrometersUseCase implements IListPyrometersUseCase {
  constructor(private readonly pyrometersClient: IPyrometersClient) {}

  async execute(): Promise<PyrometerDto[]> {
    return this.pyrometersClient.listPyrometers();
  }
}
