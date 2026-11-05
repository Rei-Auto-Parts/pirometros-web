export interface DurationParts {
  readonly hours: number;
  readonly minutes: number;
}

const MINUTES_PER_HOUR = 60;

/** Minutos corridos em horas e minutos; o texto (`min`, `h`) e da apresentacao. */
export function splitMinutes(total: number): DurationParts {
  const safe = Math.max(0, Math.floor(total));
  return { hours: Math.floor(safe / MINUTES_PER_HOUR), minutes: safe % MINUTES_PER_HOUR };
}
