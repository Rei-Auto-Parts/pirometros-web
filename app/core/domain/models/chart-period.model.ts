import type { ChartPeriodKey } from '../constants/chart-periods.constants';
import type { ReadingPeriodDto } from '../dtos/reading-period.dto';

const pad = (value: number): string => String(value).padStart(2, '0');
const HOUR_MS = 3_600_000;
const RELATIVE_HOURS: Record<Exclude<ChartPeriodKey, 'today'>, number> = {
  hour: 1,
  sixHours: 6,
  day: 24,
  threeDays: 72,
};

/** Texto local `YYYY-MM-DDTHH:mm:ss` do relogio da maquina; so descobre "agora", nao converte datas gravadas. */
function localText(moment: Date): string {
  const date = `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`;
  return `${date}T${pad(moment.getHours())}:${pad(moment.getMinutes())}:${pad(moment.getSeconds())}`;
}

/** Janela de consulta do grafico: `today` e o dia inteiro; os demais voltam do "agora". */
export function getChartPeriod(key: ChartPeriodKey, now: Date = new Date()): ReadingPeriodDto {
  if (key === 'today') {
    const day = localText(now).slice(0, 10);
    return { start: `${day}T00:00:00`, end: `${day}T23:59:59` };
  }
  const start = new Date(now.getTime() - RELATIVE_HOURS[key] * HOUR_MS);
  return { start: localText(start), end: localText(now) };
}
