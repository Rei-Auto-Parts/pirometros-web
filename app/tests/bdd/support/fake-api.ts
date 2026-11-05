import { PYROMETER_PALETTE } from '../../../core/domain/constants/pyrometer-profile.constants';
import { toEpochSeconds } from '../../../core/domain/models/reg-date.model';

/** API simulada por `fetch`: segue o contrato da pirometros-api, inclusive a exclusao de leitura sem temperatura (RF-14), o complemento e o resumo. */
export interface FakeReading {
  id: number;
  measuredAt: string;
  serial: string;
  name: string | null;
  temperature: number | null;
  unit: string | null;
  battery: number | null;
  place: number | null;
}

export type ApiMode = 'ok' | 'down' | 'pending';

interface FakePyrometer {
  id: string;
  name: string | null;
  nickname: string | null;
  color: string;
  note: string | null;
  active: boolean;
}

export interface FakeProfile {
  nickname: string | null;
  color: string | null;
  note: string | null;
  active: boolean;
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** "Agora" local em texto (o relogio falso do cenario vale aqui). */
function nowText(): string {
  const now = new Date();
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `${day}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export class FakeApi {
  mode: ApiMode = 'ok';
  health = { api: 'up', database: 'up' };
  readings: FakeReading[] = [];
  /** Complemento gravado por serial; sem entrada, vale o padrao. */
  profiles = new Map<string, FakeProfile>();
  /** Faz todo `PUT` de complemento ser recusado com 422. */
  rejectSaves = false;
  /** Faz todo `PUT` ser recusado com 409 (cor ja em uso por outro pirometro, p.ex. numa corrida). */
  rejectColorInUse = false;
  /** Corpo do ultimo `PUT` aceito, para os cenarios conferirem o que o front enviou. */
  lastSaved: { serial: string; body: FakeProfile } | null = null;
  /** Cada chamada recebida, para os cenarios conferirem o que o front pediu. */
  calls: URL[] = [];
  /** Ultima resposta de `/api/readings/series`, para conferir quais pontos o grafico recebeu. */
  lastSeries: {
    pyrometer_id: string;
    points: { measured_at: string; temperature: number | null }[];
  }[] = [];
  private nextId = 1;

  add(partial: Partial<FakeReading> & { measuredAt: string; serial: string }): FakeReading {
    const reading: FakeReading = {
      id: this.nextId++,
      name: partial.serial,
      temperature: 700,
      unit: 'C',
      battery: 80,
      place: 1,
      ...partial,
    };
    this.readings.push(reading);
    return reading;
  }

  callsTo(path: string): URL[] {
    return this.calls.filter((url) => url.pathname === path);
  }

  readonly fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input), 'http://api.local');
    this.calls.push(url);
    if (this.mode === 'down') throw new TypeError('Failed to fetch');
    if (this.mode === 'pending') return new Promise<Response>(() => undefined);
    return this.respond(url, init);
  };

  private respond(url: URL, init?: RequestInit): Response {
    if (init?.method === 'PUT' && url.pathname.startsWith('/api/pyrometers/')) {
      return this.save(decodeURIComponent(url.pathname.slice('/api/pyrometers/'.length)), init);
    }
    switch (url.pathname) {
      case '/api/health':
        return json(this.health);
      case '/api/pyrometers':
        return json(this.pyrometers());
      case '/api/pyrometers/summary':
        return json(this.summaries());
      case '/api/readings':
        return json(this.page(url));
      case '/api/readings/series':
        return json(this.series(url));
      default:
        return new Response('nao encontrado', { status: 404 });
    }
  }

  private serials(): [string, string | null][] {
    const seen = new Map<string, string | null>();
    for (const r of this.readings) seen.set(r.serial, r.name);
    return [...seen].sort(([a], [b]) => a.localeCompare(b));
  }

  private pyrometerItem(serial: string, name: string | null, index: number): FakePyrometer {
    const profile = this.profiles.get(serial);
    return {
      id: serial,
      name,
      nickname: profile?.nickname ?? null,
      color: profile?.color ?? PYROMETER_PALETTE[index % PYROMETER_PALETTE.length]?.value ?? '',
      note: profile?.note ?? null,
      active: profile?.active ?? true,
    };
  }

  private pyrometers(): object[] {
    return this.serials().map(([serial, name], index) => this.pyrometerItem(serial, name, index));
  }

  private summaries(): object[] {
    const now = toEpochSeconds(nowText());
    return this.serials().flatMap(([serial]) => {
      const latest = this.readings
        .filter((r) => r.serial === serial && r.temperature !== null)
        .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0];
      if (latest === undefined) return [];
      const minutes = Math.max(0, Math.floor((now - toEpochSeconds(latest.measuredAt)) / 60));
      return [
        {
          pyrometer_id: serial,
          temperature: latest.temperature,
          measured_at: latest.measuredAt,
          battery: latest.battery,
          minutes_without_reading: minutes,
        },
      ];
    });
  }

  /** A cor, sem diferenciar maiuscula, e a efetiva de OUTRO pirometro. */
  private colorTaken(serial: string, color: string | null): boolean {
    if (color === null) return false;
    return this.serials().some(
      ([other, name], index) =>
        other !== serial &&
        this.pyrometerItem(other, name, index).color.toLowerCase() === color.toLowerCase(),
    );
  }

  private save(serial: string, init: RequestInit): Response {
    const index = this.serials().findIndex(([candidate]) => candidate === serial);
    if (index < 0) return new Response('{}', { status: 404 });
    const body = JSON.parse(String(init.body)) as FakeProfile;
    const invalid =
      this.rejectSaves ||
      (body.nickname ?? '').length > 40 ||
      (body.color !== null && !/^#[0-9a-fA-F]{6}$/.test(body.color));
    if (invalid) return new Response('{}', { status: 422 });
    if (this.rejectColorInUse || this.colorTaken(serial, body.color)) {
      return new Response(JSON.stringify({ detail: 'cor ja esta em uso' }), { status: 409 });
    }
    this.profiles.set(serial, body);
    this.lastSaved = { serial, body };
    const [, name] = this.serials()[index] ?? [serial, null];
    return json(this.pyrometerItem(serial, name, index));
  }

  private selected(url: URL): FakeReading[] {
    const start = url.searchParams.get('start') ?? '';
    const end = url.searchParams.get('end') ?? '';
    const dev = url.searchParams.get('dev_id');
    return this.readings
      .filter((r) => r.temperature !== null)
      .filter((r) => r.measuredAt >= start && r.measuredAt <= end)
      .filter((r) => dev === null || r.serial === dev)
      .sort((a, b) =>
        a.measuredAt === b.measuredAt ? b.id - a.id : b.measuredAt.localeCompare(a.measuredAt),
      );
  }

  private page(url: URL): object {
    const all = this.selected(url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const size = Number(url.searchParams.get('page_size') ?? 50);
    return {
      items: all.slice((page - 1) * size, page * size).map((r) => ({
        id: r.id,
        measured_at: r.measuredAt,
        pyrometer_id: r.serial,
        pyrometer_name: r.name,
        temperature: r.temperature,
        unit: r.unit,
        battery: r.battery,
        place: r.place,
      })),
      total: all.length,
      page,
      page_size: size,
    };
  }

  private series(url: URL): object[] {
    const bySerial = new Map<string, FakeReading[]>();
    for (const r of [...this.selected(url)].reverse()) {
      bySerial.set(r.serial, [...(bySerial.get(r.serial) ?? []), r]);
    }
    const result = [...bySerial].map(([serial, items]) => ({
      pyrometer_id: serial,
      pyrometer_name: items[0]?.name ?? null,
      points: items.map((r) => ({ measured_at: r.measuredAt, temperature: r.temperature })),
    }));
    this.lastSeries = result;
    return result;
  }
}

function json(body: object): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}
