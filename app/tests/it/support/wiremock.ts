export const WIREMOCK = process.env['WIREMOCK_URL'] ?? 'http://wiremock:8080';

/** Cria um stub e devolve o id, para o teste apagar so o que criou (os demais arquivos compartilham o WireMock). */
export async function createStub(mapping: object): Promise<string> {
  const response = await fetch(`${WIREMOCK}/__admin/mappings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapping),
  });
  const body = (await response.json()) as { id: string };
  return body.id;
}

export async function removeStub(id: string): Promise<void> {
  await fetch(`${WIREMOCK}/__admin/mappings/${id}`, { method: 'DELETE' });
}
