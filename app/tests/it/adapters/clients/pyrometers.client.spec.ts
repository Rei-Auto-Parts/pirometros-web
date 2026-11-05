// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PyrometersClient } from '../../../../adapters/clients/pyrometers.client';
import { ProfileRejectedError } from '../../../../core/domain/errors/profile-rejected.error';
import { ReadingsUnavailableError } from '../../../../core/domain/errors/readings-unavailable.error';
import { WIREMOCK } from '../../support/wiremock';

const PROFILE = { nickname: 'Forno 2', color: '#e11d48', note: 'termopar trocado', active: true };

describe('PyrometersClient contra o WireMock', () => {
  it('deve listar os pirômetros com o complemento quando a API simulada responde 200', async () => {
    // Arrange
    const client = new PyrometersClient(`${WIREMOCK}/api`);

    // Act
    const result = await client.listPyrometers();

    // Assert
    expect(result).toEqual([
      {
        id: 'SN-001',
        name: 'Forno 1',
        nickname: 'Forno 2',
        color: '#e11d48',
        note: 'termopar trocado',
        active: true,
      },
      { id: 'SN-002', name: null, nickname: null, color: '#2563eb', note: null, active: false },
    ]);
  });

  it('deve lançar indisponibilidade quando a API simulada não existir no caminho', async () => {
    // Arrange
    const client = new PyrometersClient(`${WIREMOCK}/inexistente`);

    // Act / Assert
    await expect(client.listPyrometers()).rejects.toBeInstanceOf(ReadingsUnavailableError);
  });

  it('deve listar o resumo quando a API simulada responde 200', async () => {
    // Arrange
    const client = new PyrometersClient(`${WIREMOCK}/api`);

    // Act
    const result = await client.listSummaries();

    // Assert
    expect(result).toEqual([
      {
        pyrometerId: 'SN-001',
        temperature: 1510,
        measuredAt: '2026-11-05T10:05:00',
        battery: 62,
        minutesWithoutReading: 3,
      },
      {
        pyrometerId: 'SN-002',
        temperature: 1400,
        measuredAt: '2026-11-05T10:00:00',
        battery: null,
        minutesWithoutReading: 600,
      },
    ]);
  });

  it('deve gravar o complemento e devolver o pirômetro quando a API simulada aceita o PUT', async () => {
    // Arrange
    const client = new PyrometersClient(`${WIREMOCK}/api`);

    // Act
    const result = await client.saveProfile('SN-001', PROFILE);

    // Assert
    expect(result).toEqual({
      id: 'SN-001',
      name: 'Forno 1',
      nickname: 'Forno 2',
      color: '#e11d48',
      note: 'termopar trocado',
      active: true,
    });
  });

  it('deve lançar ProfileRejectedError 404 quando o serial não existe', async () => {
    // Arrange
    const client = new PyrometersClient(`${WIREMOCK}/api`);

    // Act / Assert
    await expect(client.saveProfile('ZZZ-404', PROFILE)).rejects.toThrow(
      new ProfileRejectedError(404),
    );
  });

  it('deve lançar ProfileRejectedError 422 quando a API recusa o complemento', async () => {
    // Arrange
    const client = new PyrometersClient(`${WIREMOCK}/api`);

    // Act / Assert
    await expect(client.saveProfile('SN-422', PROFILE)).rejects.toThrow(
      new ProfileRejectedError(422),
    );
  });

  it('deve lançar ProfileRejectedError 409 quando a cor já está em uso por outro pirômetro', async () => {
    // Arrange
    const client = new PyrometersClient(`${WIREMOCK}/api`);

    // Act / Assert
    await expect(client.saveProfile('SN-409', PROFILE)).rejects.toThrow(
      new ProfileRejectedError(409),
    );
  });
});
