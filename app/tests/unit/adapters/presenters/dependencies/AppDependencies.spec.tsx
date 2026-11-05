import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import {
  AppDependenciesProvider,
  useDependencies,
} from '../../../../../adapters/presenters/dependencies/AppDependencies';
import { buildDependencies } from '../test-render';

describe('useDependencies', () => {
  it('deve lancar erro quando usado fora do provider', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Act / Assert
    expect(() => renderHook(() => useDependencies())).toThrow(
      'useDependencies fora do AppDependenciesProvider',
    );
  });

  it('deve devolver os seis casos de uso quando usado dentro do provider', () => {
    // Arrange
    const dependencies = buildDependencies({});
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppDependenciesProvider dependencies={dependencies}>{children}</AppDependenciesProvider>
    );

    // Act
    const { result } = renderHook(() => useDependencies(), { wrapper });

    // Assert
    expect(result.current).toBe(dependencies);
    expect(Object.keys(result.current).sort()).toEqual([
      'getHealthUseCase',
      'getReadingsSeriesUseCase',
      'listPyrometerSummariesUseCase',
      'listPyrometersUseCase',
      'listReadingsUseCase',
      'savePyrometerProfileUseCase',
    ]);
  });
});
