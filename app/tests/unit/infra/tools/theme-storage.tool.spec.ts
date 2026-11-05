import { afterEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '../../../../core/domain/constants/theme.constants';
import { readStoredTheme, storeTheme } from '../../../../infra/tools/theme-storage.tool';

function fakeStorage(value: string | null): Storage {
  return {
    getItem: vi.fn<Storage['getItem']>(() => value),
    setItem: vi.fn<Storage['setItem']>(),
  } as unknown as Storage;
}

describe('theme-storage.tool', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve usar a chave nomeada pirometros.theme quando guarda a escolha', () => {
    // Act
    const key = THEME_STORAGE_KEY;

    // Assert
    expect(key).toBe('pirometros.theme');
  });

  it.each(['light', 'dark'] as const)('deve devolver %s quando esse tema esta salvo', (theme) => {
    // Arrange
    const storage = fakeStorage(theme);

    // Act
    const result = readStoredTheme(storage);

    // Assert
    expect(result).toBe(theme);
    expect(storage.getItem).toHaveBeenCalledTimes(1);
    expect(storage.getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
  });

  it('deve devolver nulo quando nao ha escolha salva', () => {
    // Act
    const result = readStoredTheme(fakeStorage(null));

    // Assert
    expect(result).toBeNull();
  });

  it.each(['blue', '', 'DARK', '1'])(
    'deve devolver nulo quando o valor salvo e invalido (%s)',
    (value) => {
      // Act
      const result = readStoredTheme(fakeStorage(value));

      // Assert
      expect(result).toBeNull();
    },
  );

  it('deve devolver nulo e nao lancar quando ler do armazenamento lanca erro', () => {
    // Arrange
    const storage = {
      getItem: () => {
        throw new Error('bloqueado');
      },
    } as unknown as Storage;

    // Act
    const result = readStoredTheme(storage);

    // Assert
    expect(result).toBeNull();
  });

  it('deve devolver nulo e nao lancar quando o proprio localStorage e bloqueado', () => {
    // Arrange
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    // Act
    const result = readStoredTheme();

    // Assert
    expect(result).toBeNull();
  });

  it('deve ler o localStorage real quando nenhum armazenamento e informado', () => {
    // Arrange
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    // Act
    const result = readStoredTheme();

    // Assert
    expect(result).toBe('dark');
  });

  it('deve gravar a escolha na chave nomeada quando o tema e salvo', () => {
    // Arrange
    const storage = fakeStorage(null);

    // Act
    storeTheme('dark', storage);

    // Assert
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
  });

  it('deve nao lancar quando gravar no armazenamento lanca erro', () => {
    // Arrange
    const storage = {
      setItem: () => {
        throw new Error('cheio');
      },
    } as unknown as Storage;

    // Act / Assert
    expect(() => storeTheme('dark', storage)).not.toThrow();
  });

  it('deve nao lancar quando o proprio localStorage e bloqueado ao gravar', () => {
    // Arrange
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    // Act / Assert
    expect(() => storeTheme('light')).not.toThrow();
  });

  it('deve gravar no localStorage real quando nenhum armazenamento e informado', () => {
    // Act
    storeTheme('light');

    // Assert
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});
