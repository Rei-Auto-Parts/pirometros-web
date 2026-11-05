import { describe, expect, it } from 'vitest';
import {
  CHART_PERIODS,
  DEFAULT_CHART_PERIOD,
} from '../../../../../core/domain/constants/chart-periods.constants';
import { t } from '../../../../../infra/tools/i18n.tool';

describe('CHART_PERIODS', () => {
  it('deve listar os cinco periodos na ordem da tela quando lida', () => {
    // Act
    const labels = CHART_PERIODS.map((period) => t(period.labelKey));

    // Assert
    expect(labels).toEqual([
      'Última hora',
      'Últimas 6 horas',
      'Últimas 24 horas',
      'Hoje',
      'Últimos 3 dias',
    ]);
  });

  it('deve usar Hoje como periodo padrao quando nenhum e escolhido', () => {
    // Act
    const keys = CHART_PERIODS.map((period) => period.key);

    // Assert
    expect(DEFAULT_CHART_PERIOD).toBe('today');
    expect(keys).toContain(DEFAULT_CHART_PERIOD);
  });
});
