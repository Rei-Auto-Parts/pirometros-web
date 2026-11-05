import { describe, expect, it } from 'vitest';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import {
  displayName,
  displayParts,
  findPyrometer,
  onlyActive,
  resolveName,
  sortByDisplayName,
} from '../../../../../core/domain/models/pyrometer-name.model';

function build(overrides: Partial<PyrometerDto>): PyrometerDto {
  return {
    id: 'SN-1',
    name: 'PI-12',
    nickname: null,
    color: '#2563eb',
    note: null,
    active: true,
    ...overrides,
  };
}

describe('displayName', () => {
  it('deve juntar a tag e o apelido como "TAG - APELIDO" quando ha apelido', () => {
    // Arrange
    const pyrometer = build({ nickname: 'Forno 2' });

    // Act
    const name = displayName(pyrometer);

    // Assert
    expect(name).toBe('PI-12 - Forno 2');
  });

  it('deve mostrar so a tag quando nao ha apelido', () => {
    // Arrange
    const pyrometer = build({});

    // Act
    const name = displayName(pyrometer);

    // Assert
    expect(name).toBe('PI-12');
  });

  it('deve usar o serial como tag quando nao ha nome do aparelho nem apelido', () => {
    // Arrange
    const pyrometer = build({ name: null });

    // Act
    const name = displayName(pyrometer);

    // Assert
    expect(name).toBe('SN-1');
  });

  it('deve usar o serial como tag e manter o apelido quando nao ha nome do aparelho', () => {
    // Arrange
    const pyrometer = build({ name: null, nickname: 'Forno 2' });

    // Act
    const name = displayName(pyrometer);

    // Assert
    expect(name).toBe('SN-1 - Forno 2');
  });

  it('deve ignorar o apelido em branco quando ele so tem espacos', () => {
    // Arrange
    const pyrometer = build({ nickname: '   ' });

    // Act
    const name = displayName(pyrometer);

    // Assert
    expect(name).toBe('PI-12');
  });

  it('deve nao deixar o apelido substituir a tag quando ha apelido', () => {
    // Arrange
    const pyrometer = build({ name: 'PI-14', nickname: 'Forno 1' });

    // Act
    const name = displayName(pyrometer);

    // Assert
    expect(name.startsWith('PI-14')).toBe(true);
  });
});

describe('onlyActive', () => {
  it('deve manter so os ativos quando ha ativos e inativos', () => {
    // Arrange
    const list = [build({ id: 'A' }), build({ id: 'B', active: false })];

    // Act
    const result = onlyActive(list);

    // Assert
    expect(result.map((item) => item.id)).toEqual(['A']);
  });
});

describe('sortByDisplayName', () => {
  it('deve ordenar em ordem alfabetica pelo nome mostrado quando ha apelidos e nomes', () => {
    // Arrange
    const list = [
      build({ id: 'A', name: 'PI-14' }),
      build({ id: 'B', name: 'PI-12', nickname: 'Forno 2' }),
      build({ id: 'C', name: 'PI-13' }),
    ];

    // Act
    const result = sortByDisplayName(list);

    // Assert
    expect(result.map((item) => displayName(item))).toEqual(['PI-12 - Forno 2', 'PI-13', 'PI-14']);
  });

  it('deve ignorar acento e caixa quando compara os nomes', () => {
    // Arrange
    const list = [build({ id: 'A', nickname: 'zebra' }), build({ id: 'B', nickname: 'Árvore' })];

    // Act
    const result = sortByDisplayName(list);

    // Assert
    expect(result.map((item) => item.id)).toEqual(['B', 'A']);
  });

  it('deve manter a lista original intacta quando ordena', () => {
    // Arrange
    const list = [build({ id: 'B', nickname: 'B' }), build({ id: 'A', nickname: 'A' })];

    // Act
    sortByDisplayName(list);

    // Assert
    expect(list.map((item) => item.id)).toEqual(['B', 'A']);
  });
});

describe('findPyrometer e resolveName', () => {
  it('deve achar o pirometro pelo serial quando ele esta na lista', () => {
    // Arrange
    const list = [build({ id: 'A' }), build({ id: 'B' })];

    // Act
    const found = findPyrometer(list, 'B');

    // Assert
    expect(found?.id).toBe('B');
  });

  it('deve devolver indefinido quando o serial e nulo', () => {
    // Act
    const found = findPyrometer([build({})], null);

    // Assert
    expect(found).toBeUndefined();
  });

  it('deve devolver o nome mostrado quando o serial esta na lista', () => {
    // Arrange
    const list = [build({ id: 'A', nickname: 'Forno 2' })];

    // Act
    const name = resolveName(list, 'A', 'PI-12');

    // Assert
    expect(name).toBe('PI-12 - Forno 2');
  });

  it('deve devolver o nome de reserva quando o serial nao esta na lista', () => {
    // Act
    const name = resolveName([], 'A', 'PI-12');

    // Assert
    expect(name).toBe('PI-12');
  });

  it('deve devolver o serial quando nao ha lista nem nome de reserva', () => {
    // Act
    const name = resolveName([], 'A', null);

    // Assert
    expect(name).toBe('A');
  });

  it('deve devolver texto vazio quando nao ha serial, lista nem nome de reserva', () => {
    // Act
    const name = resolveName([], null, null);

    // Assert
    expect(name).toBe('');
  });
});

describe('displayParts', () => {
  it('deve separar a tag e o apelido quando ha apelido', () => {
    // Act
    const parts = displayParts(build({ nickname: 'Forno 2' }));

    // Assert
    expect(parts).toEqual({ tag: 'PI-12', nickname: 'Forno 2' });
  });

  it('deve devolver apelido nulo quando nao ha apelido', () => {
    // Act
    const parts = displayParts(build({}));

    // Assert
    expect(parts).toEqual({ tag: 'PI-12', nickname: null });
  });

  it('deve usar o serial como tag quando nao ha nome do aparelho', () => {
    // Act
    const parts = displayParts(build({ name: null, nickname: '  ' }));

    // Assert
    expect(parts).toEqual({ tag: 'SN-1', nickname: null });
  });
});
