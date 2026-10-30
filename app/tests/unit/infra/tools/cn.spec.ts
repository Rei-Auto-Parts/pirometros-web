import { describe, expect, it } from 'vitest';
import { cn } from '../../../../infra/tools/cn';

describe('cn', () => {
  it('deve manter a ultima classe do Tailwind quando ha conflito', () => {
    // Act
    const result = cn('p-2', false && 'hidden', 'p-4');

    // Assert
    expect(result).toBe('p-4');
  });
});
