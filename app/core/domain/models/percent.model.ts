/** Limita um valor ao intervalo de 0 a 100 (so para desenhar a barra; o texto mostra o valor real). */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}
