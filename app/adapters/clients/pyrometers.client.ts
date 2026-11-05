import type { PyrometerDto } from '../../core/domain/dtos/pyrometer.dto';
import type { PyrometerProfileDto } from '../../core/domain/dtos/pyrometer-profile.dto';
import type { PyrometerSummaryDto } from '../../core/domain/dtos/pyrometer-summary.dto';
import type { IPyrometersClient } from '../../interfaces/adapters/clients/i-pyrometers.client';
import type { components } from './api-schema';
import { fetchJson, putJson } from './fetch-json';

type PyrometerResponse = components['schemas']['PyrometerResponse'];
type PyrometerSummaryResponse = components['schemas']['PyrometerSummaryResponse'];

function toPyrometer(item: PyrometerResponse): PyrometerDto {
  return {
    id: item.id,
    name: item.name ?? null,
    nickname: item.nickname ?? null,
    color: item.color,
    note: item.note ?? null,
    active: item.active,
  };
}

export class PyrometersClient implements IPyrometersClient {
  constructor(
    private readonly baseUrl: string = '/api',
    private readonly fetcher: typeof fetch = (...args) => fetch(...args),
  ) {}

  async listPyrometers(): Promise<PyrometerDto[]> {
    const body = await fetchJson<PyrometerResponse[]>(this.fetcher, `${this.baseUrl}/pyrometers`);
    return body.map(toPyrometer);
  }

  async listSummaries(): Promise<PyrometerSummaryDto[]> {
    const body = await fetchJson<PyrometerSummaryResponse[]>(
      this.fetcher,
      `${this.baseUrl}/pyrometers/summary`,
    );
    return body.map((item) => ({
      pyrometerId: item.pyrometer_id,
      temperature: item.temperature,
      measuredAt: item.measured_at,
      battery: item.battery ?? null,
      minutesWithoutReading: item.minutes_without_reading,
    }));
  }

  async saveProfile(pyrometerId: string, profile: PyrometerProfileDto): Promise<PyrometerDto> {
    const body = await putJson<PyrometerResponse>(
      this.fetcher,
      `${this.baseUrl}/pyrometers/${encodeURIComponent(pyrometerId)}`,
      {
        nickname: profile.nickname,
        color: profile.color,
        note: profile.note,
        active: profile.active,
      },
    );
    return toPyrometer(body);
  }
}
