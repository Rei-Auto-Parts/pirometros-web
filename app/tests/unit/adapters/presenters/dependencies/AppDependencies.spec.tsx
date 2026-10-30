import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDependencies } from '../../../../../adapters/presenters/dependencies/AppDependencies';

describe('useDependencies', () => {
  it('deve lancar erro quando usado fora do provider', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Act / Assert
    expect(() => renderHook(() => useDependencies())).toThrow(
      'useDependencies fora do AppDependenciesProvider',
    );
  });
});
