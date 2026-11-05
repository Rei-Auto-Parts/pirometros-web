const MIN_MARGIN = 20;
const MARGIN_RATIO = 0.05;
const COARSE_STEP = 50;
const FINE_STEP = 10;
/** Faixa total a partir da qual os limites arredondam a multiplos de 50 (abaixo, de 10). */
const COARSE_FROM = 200;

/**
 * Dominio do eixo de temperatura ajustado aos valores exibidos: `[min - margem, max + margem]`, margem de 5%
 * da amplitude (minimo 20), limites arredondados a multiplos de 50 (ou 10). Nunca parte de 0 por padrao.
 * Sem valores devolve `null`: o grafico usa o dominio padrao.
 */
export function buildValueAxis(values: readonly number[]): readonly [number, number] | null {
  if (values.length === 0) return null;
  let min = values[0] as number;
  let max = min;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const margin = Math.max((max - min) * MARGIN_RATIO, MIN_MARGIN);
  const low = min - margin;
  const high = max + margin;
  const step = high - low >= COARSE_FROM ? COARSE_STEP : FINE_STEP;
  return [Math.floor(low / step) * step, Math.ceil(high / step) * step];
}
