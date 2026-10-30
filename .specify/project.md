# pirometros-web

> Identidade e princípios **deste** projeto. Este arquivo **é versionado** — é o que o time
> compartilha. Os princípios da organização ficam em `.specify/memory/constitution.md`, que o
> `/bu:constitution` gera a cada clone e o `.gitignore` mantém fora do git.

## Identidade

- **Projeto**: pirometros-web
- **Tipo**: frontend
- **Stack**: React, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, shadcn/ui, Recharts, nginx
- **Domínio**: front-end interno da fundição que mostra aos gestores as leituras dos pirômetros de imersão, em informação e histórico (não é tempo real para a produção).
- **Cobertura mínima acordada**: 90%

## Contexto

- A API (`pirometros-api`) lê as leituras que um sincronizador copia a cada 5 minutos para o Postgres, banco `pirometros`, tabela `public.receiver_data`. Este front só conversa com a API, sob `/api`.
- Deploy: VPS Linux interna com Easypanel; o app é construído a partir do `Dockerfile` de `app/`. Produção servida por nginx, com proxy de `/api` para a API.
- Os tipos da API são gerados do OpenAPI da FastAPI (`make api-types`) em `app/adapters/clients/api-schema.d.ts`.

## Princípios específicos deste projeto

> Cada princípio declara o que **proíbe**.

### Princípio 1 — Interface em português do Brasil

Todo texto visível ao usuário é em português do Brasil, acessado por chave em
`core/domain/constants/text-keys.constants.ts`. **Proíbe**: texto de interface em outro idioma e
literal de texto solto em componente.

### Princípio 2 — `reg_date` sem conversão de fuso

`reg_date` é `timestamp` sem fuso, em horário local (America/Sao_Paulo), e assim deve ser exibido.
**Proíbe**: converter fuso, aplicar `Date` com offset/UTC, `toLocaleString` com `timeZone` ou
qualquer biblioteca de fuso sobre `reg_date`. O valor é tratado como texto/horário local, como veio
da API.

### Princípio 3 — Sem autenticação por enquanto

A VPS é interna e só a rede da empresa acessa. **Proíbe**: tela de login, usuários, perfis, token,
cookie de sessão ou qualquer controle de acesso no front até que uma spec o peça.

### Princípio 4 — Endereço da API em tempo de execução

O endereço da API é variável de ambiente lida pelo nginx na subida do container (`API_URL`).
**Proíbe**: embutir o endereço da API no bundle, usar `VITE_*` para ele ou exigir rebuild para
trocar de ambiente. O front chama sempre o caminho relativo `/api`.

### Princípio 5 — Rede só por client

Segue a regra de frontend da organização, e acrescenta: **proíbe** `fetch`/`axios` fora de
`app/adapters/clients/`, e proíbe editar à mão `api-schema.d.ts` (arquivo gerado).

### Princípio 6 — Código gerado fora da cobertura

`app/adapters/presenters/ui/` (shadcn/ui, copiado do registro) e `api-schema.d.ts` (gerado do
OpenAPI) ficam fora da conta de cobertura e do Prettier. **Proíbe** colocar lógica própria em
`ui/`: ela mora em `adapters/presenters/` ou em `core/`.

### Princípio 7 — Sem segredos versionados

**Proíbe**: commitar `.env`, credencial ou qualquer segredo; o `.env.example` traz apenas
placeholders.

## Emendas

| Versão | Data | O que mudou |
|---|---|---|
| 1.0.0 | 2026-10-30 | ratificação inicial |
