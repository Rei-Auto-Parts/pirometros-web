import { describe, expect, it } from 'vitest';
import { TEXT_KEYS } from '../../../../core/domain/constants/text-keys.constants';
import { t } from '../../../../infra/tools/i18n.tool';

describe('t', () => {
  it('deve devolver o texto em portugues do Brasil quando a chave existe', () => {
    // Act
    const text = t(TEXT_KEYS.stateDown);

    // Assert
    expect(text).toBe('Fora do ar');
  });

  it('deve ter texto nao vazio para toda chave declarada', () => {
    // Act
    const empty = Object.values(TEXT_KEYS).filter((key) => t(key).trim() === '');

    // Assert
    expect(empty).toEqual([]);
  });
});
