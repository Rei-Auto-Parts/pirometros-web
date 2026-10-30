/**
 * Gera `adapters/clients/api-schema.d.ts` a partir do OpenAPI da FastAPI.
 *
 * Uso: npm run api:types -- [url-ou-arquivo]
 * Sem argumento, le `${API_PROXY_TARGET}/api/openapi.json` (a API precisa estar no ar).
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const OUTPUT = path.resolve(import.meta.dirname, '../adapters/clients/api-schema.d.ts');
const HEADER = '// Gerado por `npm run api:types` a partir do OpenAPI da API. Nao edite.\n\n';

function resolveSource(argument: string | undefined): URL {
  if (argument === undefined) {
    const base = process.env['API_PROXY_TARGET'] ?? 'http://host.docker.internal:8000';
    return new URL(`${base}/api/openapi.json`);
  }
  return /^https?:\/\//.test(argument) ? new URL(argument) : pathToFileURL(path.resolve(argument));
}

const source = resolveSource(process.argv[2]);
const ast = await openapiTS(source);
writeFileSync(OUTPUT, HEADER + astToString(ast));
console.log(`tipos gerados em ${OUTPUT} a partir de ${source.href}`);
