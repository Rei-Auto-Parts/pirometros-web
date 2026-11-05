import { describe, expect, it } from 'vitest';
import { buildValueAxis } from '../../../../../core/domain/models/value-axis.model';

describe('buildValueAxis', () => {
  it('deve devolver nulo quando nao ha valores, para o grafico usar o dominio padrao', () => {
    // Act
    const axis = buildValueAxis([]);

    // Assert
    expect(axis).toBeNull();
  });

  it('deve ir de 1450 a 1750 quando as temperaturas vao de 1480 a 1700', () => {
    // Act
    const axis = buildValueAxis([1480, 1600, 1700]);

    // Assert
    expect(axis).toEqual([1450, 1750]);
  });

  it('deve nunca partir de 0 quando as temperaturas sao altas', () => {
    // Act
    const axis = buildValueAxis([1480, 1700]);

    // Assert
    expect(axis?.[0]).toBeGreaterThan(0);
  });

  it('deve usar a margem minima de 20 graus quando 5% da amplitude e menor', () => {
    // Act
    const axis = buildValueAxis([1500, 1520]);

    // Assert
    expect(axis).toEqual([1480, 1540]);
  });

  it('deve arredondar a multiplos de 10 quando a faixa total e menor que 200', () => {
    // Act
    const axis = buildValueAxis([1503, 1507]);

    // Assert
    expect(axis).toEqual([1480, 1530]);
  });

  it('deve arredondar a multiplos de 50 quando a faixa total chega a 200 ou mais', () => {
    // Act
    const axis = buildValueAxis([1000, 1160]);

    // Assert
    expect(axis).toEqual([950, 1200]);
  });

  it('deve usar 5% da amplitude como margem quando ela passa de 20 graus', () => {
    // Act
    const axis = buildValueAxis([1000, 2000]);

    // Assert
    expect(axis).toEqual([950, 2050]);
  });

  it('deve abrir a faixa em torno do valor quando ha um valor so', () => {
    // Act
    const axis = buildValueAxis([1500]);

    // Assert
    expect(axis).toEqual([1480, 1520]);
  });

  it('deve manter todos os valores dentro do dominio quando a faixa e qualquer uma', () => {
    // Arrange
    const values = [1483, 1597, 1699];

    // Act
    const axis = buildValueAxis(values);

    // Assert
    expect(Math.min(...values)).toBeGreaterThanOrEqual(axis?.[0] ?? 0);
    expect(Math.max(...values)).toBeLessThanOrEqual(axis?.[1] ?? 0);
  });

  it('deve funcionar com temperaturas baixas sem prender em 0 quando a faixa fica abaixo de 100', () => {
    // Act
    const axis = buildValueAxis([60, 80]);

    // Assert
    expect(axis).toEqual([40, 100]);
  });
});
