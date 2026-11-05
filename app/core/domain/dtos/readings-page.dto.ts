import type { ReadingDto } from './reading.dto';

export interface ReadingsPageDto {
  readonly items: readonly ReadingDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
