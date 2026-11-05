import type { IPyrometersClient } from '../../interfaces/adapters/clients/i-pyrometers.client';
import type { IListPyrometerSummariesUseCase } from '../../interfaces/core/application/i-list-pyrometer-summaries.use-case';
import type { PyrometerSummaryDto } from '../domain/dtos/pyrometer-summary.dto';

export class ListPyrometerSummariesUseCase implements IListPyrometerSummariesUseCase {
  constructor(private readonly pyrometersClient: IPyrometersClient) {}

  async execute(): Promise<PyrometerSummaryDto[]> {
    return this.pyrometersClient.listSummaries();
  }
}
