import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useTheme } from '../../../../../adapters/presenters/hooks/useTheme';

describe('useTheme', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
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
});
