import type { IReadingsClient } from '../../interfaces/adapters/clients/i-readings.client';
import type {
  IListReadingsUseCase,
  ListReadingsInput,
} from '../../interfaces/core/application/i-list-readings.use-case';
import { READINGS_PAGE_SIZE } from '../domain/constants/readings.constants';
import type { ReadingsPageDto } from '../domain/dtos/readings-page.dto';
import { getTodayPeriod } from '../domain/models/reading-period.model';
import { endOfMinute, startOfMinute } from '../domain/models/reg-date.model';

export class ListReadingsUseCase implements IListReadingsUseCase {
  constructor(private readonly readingsClient: IReadingsClient) {}

  /** Sem periodo escolhido vale o dia de hoje, resolvido a cada consulta. */
  async execute(input: ListReadingsInput): Promise<ReadingsPageDto> {
    const period =
      input.period === null
        ? getTodayPeriod()
        : { start: startOfMinute(input.period.start), end: endOfMinute(input.period.end) };
    const page = await this.readingsClient.listReadings({
      period,
      pyrometerId: input.pyrometerId,
      page: input.page,
      pageSize: READINGS_PAGE_SIZE,
    });
    return { ...page, items: page.items.filter((reading) => reading.temperature !== null) };
  }
}
