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

  it('deve nomear a tela de saude como Saude do sistema quando pede o titulo da antiga pagina inicial', () => {
    // Act
    const title = t(TEXT_KEYS.homeTitle);

    // Assert
    expect(title).toBe('Saúde do sistema');
  });

  it('deve devolver os quatro itens do menu lateral quando pede os nomes da navegacao', () => {
    // Act
    const items = [
      TEXT_KEYS.navMonitoring,
      TEXT_KEYS.navReadings,
      TEXT_KEYS.navPyrometers,
      TEXT_KEYS.navHealth,
    ].map(t);

    // Assert
    expect(items).toEqual(['Acompanhamento', 'Leituras', 'Pirômetros', 'Saúde do sistema']);
  });
});
