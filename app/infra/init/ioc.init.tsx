import { HealthClient } from '../../adapters/clients/health.client';
import { PyrometersClient } from '../../adapters/clients/pyrometers.client';
import { ReadingsClient } from '../../adapters/clients/readings.client';
import { GetHealthUseCase } from '../../core/application/get-health.use-case';
import { GetReadingsSeriesUseCase } from '../../core/application/get-readings-series.use-case';
import { ListPyrometerSummariesUseCase } from '../../core/application/list-pyrometer-summaries.use-case';
import { ListPyrometersUseCase } from '../../core/application/list-pyrometers.use-case';
import { ListReadingsUseCase } from '../../core/application/list-readings.use-case';
import { SavePyrometerProfileUseCase } from '../../core/application/save-pyrometer-profile.use-case';
import { WebEntry } from '../web/web-entry';

export function buildWebEntry(): WebEntry {
  const readingsClient = new ReadingsClient();
  const pyrometersClient = new PyrometersClient();
  return new WebEntry({
    getHealthUseCase: new GetHealthUseCase(new HealthClient()),
    listReadingsUseCase: new ListReadingsUseCase(readingsClient),
    getReadingsSeriesUseCase: new GetReadingsSeriesUseCase(readingsClient),
    listPyrometersUseCase: new ListPyrometersUseCase(pyrometersClient),
    listPyrometerSummariesUseCase: new ListPyrometerSummariesUseCase(pyrometersClient),
    savePyrometerProfileUseCase: new SavePyrometerProfileUseCase(pyrometersClient),
  });
}
