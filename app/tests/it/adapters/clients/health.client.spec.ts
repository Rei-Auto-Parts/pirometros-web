// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { HealthClient } from '../../../../adapters/clients/health.client';
import { HealthUnavailableError } from '../../../../core/domain/errors/health-unavailable.error';
import { createStub, removeStub, WIREMOCK } from '../../support/wiremock';

const stubs: string[] = [];

async function stubHealth(response: object): Promise<void> {
  stubs.push(
    await createStub({
      request: { method: 'GET', urlPath: '/api/health' },
      response: { headers: { 'Content-Type': 'application/json' }, ...response },
    }),
  );
}

describe('HealthClient contra o WireMock', () => {
  afterEach(async () => {
    await Promise.all(stubs.splice(0).map(removeStub));
  });

  it('deve devolver o estado quando a API simulada responde 200', async () => {
    // Arrange
    await stubHealth({ status: 200, jsonBody: { api: 'up', database: 'down' } });

    // Act
    const result = await new HealthClient(`${WIREMOCK}/api`).getHealth();

    // Assert
    expect(result).toEqual({ api: 'up', database: 'down' });
  });

  it('deve lancar indisponibilidade quando a API simulada responde 502', async () => {
    // Arrange
    await stubHealth({ status: 502 });

    // Act / Assert
    await expect(new HealthClient(`${WIREMOCK}/api`).getHealth()).rejects.toBeInstanceOf(
      HealthUnavailableError,
    );
  });
});
