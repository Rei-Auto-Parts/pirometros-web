import { describe, expect, it } from 'vitest';
import {
  NICKNAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  PYROMETER_PALETTE,
} from '../../../../../core/domain/constants/pyrometer-profile.constants';
import { t } from '../../../../../infra/tools/i18n.tool';

/** A mesma paleta, na mesma ordem, de `pirometros-api` (`PALETTE`). */
const API_PALETTE = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#ea580c',
  '#4f46e5',
  '#0d9488',
  '#78716c',
];

describe('PYROMETER_PALETTE', () => {
  it('deve ter as mesmas 12 cores, na mesma ordem, da API quando lida', () => {
    // Act
    const values = PYROMETER_PALETTE.map((color) => color.value);

    // Assert
    expect(values).toEqual(API_PALETTE);
  });

  it('deve ter nome em portugues distinto para cada cor quando lida', () => {
    // Act
    const names = PYROMETER_PALETTE.map((color) => t(color.nameKey));

    // Assert
    expect(new Set(names).size).toBe(12);
  });
});

describe('limites do complemento', () => {
  it('deve limitar apelido a 40 e observacao a 500 caracteres quando lidos', () => {
    // Act
    const limits = [NICKNAME_MAX_LENGTH, NOTE_MAX_LENGTH];

    // Assert
    expect(limits).toEqual([40, 500]);
  });
});
