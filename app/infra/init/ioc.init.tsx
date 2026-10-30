import { HealthClient } from '../../adapters/clients/health.client';
import { GetHealthUseCase } from '../../core/application/get-health.use-case';
import { WebEntry } from '../web/web-entry';

export function buildWebEntry(): WebEntry {
  return new WebEntry({ getHealthUseCase: new GetHealthUseCase(new HealthClient()) });
}
