import { describe, expect, it } from 'vitest';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';

describe('ReadingsUnavailableError', () => {
  it('deve montar a mensagem com o detalhe quando recebe um detalhe', () => {
    // Arrange
    const detail = 'timeout na API';

    // Act
    const error = new ReadingsUnavailableError(detail);

    // Assert
    expect(error.message).toBe('leituras indisponiveis: timeout na API');
  });

  it('deve ter o nome ReadingsUnavailableError quando instanciado', () => {
    // Arrange
    const detail = 'qualquer';

    // Act
    const error = new ReadingsUnavailableError(detail);

    // Assert
    expect(error.name).toBe('ReadingsUnavailableError');
  });

  it('deve ser instancia de Error quando instanciado', () => {
    // Arrange
    const detail = 'qualquer';

    // Act
    const error = new ReadingsUnavailableError(detail);

    // Assert
    expect(error).toBeInstanceOf(Error);
  });
});
