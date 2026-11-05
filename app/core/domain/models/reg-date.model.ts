/** `reg_date` e texto local sem fuso (`YYYY-MM-DDTHH:mm:ss`): nunca passa por `Date`. */

const pad = (value: number): string => String(value).padStart(2, '0');

export function formatRegDate(value: string): string {
  const [date = '', time = ''] = value.split('T');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time.slice(0, 5)}`.trim();
}

export function secondsOfDay(value: string): number {
  const [hours = '0', minutes = '0', seconds = '0'] = (value.split('T')[1] ?? '').split(':');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

export function formatClock(seconds: number): string {
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}`;
}

/** Valor de `datetime-local` (`YYYY-MM-DDTHH:mm`) como inicio do minuto. */
export function startOfMinute(value: string): string {
  return `${value.slice(0, 16)}:00`;
}

/** Valor de `datetime-local` como fim do minuto, para o minuto escolhido entrar inteiro. */
export function endOfMinute(value: string): string {
  return `${value.slice(0, 16)}:59`;
}

const SECONDS_PER_DAY = 86400;

/** Dias desde 01/01/1970 no calendario gregoriano; aritmetica pura, sem `Date` (P2). */
function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yearOfEra = y - era * 400;
  const dayOfYear = Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

/** Inverso de `daysFromCivil`: mes e dia de um numero de dias desde 01/01/1970. */
function monthAndDay(days: number): { month: number; day: number } {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const dayOfEra = z - era * 146097;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / 1460) +
      Math.floor(dayOfEra / 36524) -
      Math.floor(dayOfEra / 146096)) /
      365,
  );
  const dayOfYear =
    dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthIndex = Math.floor((5 * dayOfYear + 2) / 153);
  return {
    day: dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1,
    month: monthIndex < 10 ? monthIndex + 3 : monthIndex - 9,
  };
}

/** Segundos corridos do texto local: so serve de posicao no eixo do grafico, nao e um instante real. */
export function toEpochSeconds(value: string): number {
  const [year = '1970', month = '1', day = '1'] = (value.split('T')[0] ?? '').split('-');
  return (
    daysFromCivil(Number(year), Number(month), Number(day)) * SECONDS_PER_DAY + secondsOfDay(value)
  );
}

/** Rotulo do eixo: `HH:mm`, ou `dd/MM HH:mm` quando o periodo passa de um dia. */
export function formatEpoch(seconds: number, withDate: boolean): string {
  const days = Math.floor(seconds / SECONDS_PER_DAY);
  const clock = formatClock(seconds - days * SECONDS_PER_DAY);
  if (!withDate) return clock;
  const { month, day } = monthAndDay(days);
  return `${pad(day)}/${pad(month)} ${clock}`;
}
