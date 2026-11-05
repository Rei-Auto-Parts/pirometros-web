import type { ReadingsPageDto } from '../../../core/domain/dtos/readings-page.dto';

export interface ListReadingsInput {
  /** Valores de `datetime-local` (`YYYY-MM-DDTHH:mm`); `null` = dia de hoje. */
  readonly period: { readonly start: string; readonly end: string } | null;
  readonly pyrometerId: string | null;
  readonly page: number;
}

export interface IListReadingsUseCase {
  execute(input: ListReadingsInput): Promise<ReadingsPageDto>;
}
