import { describe, expect, it } from 'vitest';
import { ProfileRejectedError } from '../../../../../core/domain/errors/profile-rejected.error';

describe('ProfileRejectedError', () => {
  it('deve guardar o status quando a API recusa o complemento', () => {
    // Arrange
    const status = 422;

    // Act
    const error = new ProfileRejectedError(status);

    // Assert
    expect(error.status).toBe(422);
  });

  it('deve citar o status na mensagem quando criado', () => {
    // Act
    const error = new ProfileRejectedError(404);

    // Assert
    expect(error.message).toBe('complemento recusado: status HTTP 404');
  });

  it('deve ser um Error com nome proprio quando criado', () => {
    // Act
    const error = new ProfileRejectedError(422);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ProfileRejectedError');
  });
});
