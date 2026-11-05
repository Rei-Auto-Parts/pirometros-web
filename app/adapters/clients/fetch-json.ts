import { ProfileRejectedError } from '../../core/domain/errors/profile-rejected.error';
import { ReadingsUnavailableError } from '../../core/domain/errors/readings-unavailable.error';

async function send(fetcher: typeof fetch, url: string, init?: RequestInit): Promise<Response> {
  try {
    return await (init === undefined ? fetcher(url) : fetcher(url, init));
  } catch (error) {
    throw new ReadingsUnavailableError(`falha de rede: ${String(error)}`);
  }
}

/** GET que devolve JSON; rede fora ou HTTP nao-2xx viram `ReadingsUnavailableError`. */
export async function fetchJson<T>(fetcher: typeof fetch, url: string): Promise<T> {
  const response = await send(fetcher, url);
  if (!response.ok) {
    throw new ReadingsUnavailableError(`status HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

const REJECTED_STATUSES: readonly number[] = [404, 409, 422];

/**
 * PUT com corpo JSON. 404, 409 (cor ja em uso) e 422 (a API recusou o que foi enviado) viram `ProfileRejectedError`;
 * rede fora ou qualquer outro HTTP nao-2xx viram `ReadingsUnavailableError`.
 */
export async function putJson<T>(fetcher: typeof fetch, url: string, body: unknown): Promise<T> {
  const response = await send(fetcher, url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (REJECTED_STATUSES.includes(response.status)) {
    throw new ProfileRejectedError(response.status);
  }
  if (!response.ok) {
    throw new ReadingsUnavailableError(`status HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}
