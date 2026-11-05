import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTheme } from '../../../../../adapters/presenters/hooks/useTheme';
import { THEME_STORAGE_KEY } from '../../../../../core/domain/constants/theme.constants';

describe('useTheme', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
  });

  it('deve abrir no tema light quando o hook e montado', () => {
    // Arrange
    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.theme).toBe('light');
  });

  it('deve manter o html sem a classe dark quando o hook e montado', () => {
    // Arrange
    // Act
    renderHook(() => useTheme());

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve passar ao tema dark quando toggle e chamado uma vez', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => result.current.toggle());

    // Assert
    expect(result.current.theme).toBe('dark');
  });

  it('deve adicionar a classe dark ao html quando toggle e chamado uma vez', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => result.current.toggle());

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve voltar ao tema light quando toggle e chamado duas vezes', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => result.current.toggle());
    act(() => result.current.toggle());

    // Assert
    expect(result.current.theme).toBe('light');
  });

  it('deve remover a classe dark do html quando toggle e chamado duas vezes', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => result.current.toggle());
    act(() => result.current.toggle());

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve abrir no tema escuro e aplicar a classe dark quando o escuro esta salvo', () => {
    // Arrange
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve abrir no tema claro quando o claro esta salvo', () => {
    // Arrange
    localStorage.setItem(THEME_STORAGE_KEY, 'light');

    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.theme).toBe('light');
  });

  it('deve abrir no tema claro quando o valor salvo e invalido', () => {
    // Arrange
    localStorage.setItem(THEME_STORAGE_KEY, 'azul');

    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve nao gravar nada quando o hook e montado sem escolha do usuario', () => {
    // Arrange / Act
    renderHook(() => useTheme());

    // Assert
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('deve gravar dark quando toggle passa ao escuro', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => result.current.toggle());

    // Assert
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('deve gravar light quando toggle volta ao claro', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());

    // Act
    act(() => result.current.toggle());

    // Assert
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('deve manter o escuro depois de remontar o hook, como um F5, quando o usuario escolheu escuro', () => {
    // Arrange
    const first = renderHook(() => useTheme());
    act(() => first.result.current.toggle());
    first.unmount();
    document.documentElement.classList.remove('dark');

    // Act
    const second = renderHook(() => useTheme());

    // Assert
    expect(second.result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve abrir no claro e nao lancar quando ler o armazenamento lanca erro', () => {
    // Arrange
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    // Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.theme).toBe('light');
  });

  it('deve alternar o tema na sessao e nao lancar quando gravar no armazenamento lanca erro', () => {
    // Arrange
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cheio');
    });
    const { result } = renderHook(() => useTheme());

    // Act
    act(() => result.current.toggle());

    // Assert
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
