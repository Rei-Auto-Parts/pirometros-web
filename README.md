# pirometros-web

Front-end interno da fundição que mostra aos gestores as leituras dos pirômetros de imersão.
Stack: React, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, shadcn/ui e
Recharts; em produção, nginx. Interface em português do Brasil. Segue o padrão de
desenvolvimento da Byte Union.

Este repositório só conversa com a **pirometros-api**, sempre pelo caminho relativo `/api`.
Restrições (detalhes em `.specify/project.md`): sem autenticação por enquanto (a VPS é
interna) e `reg_date` nunca tem o fuso convertido.

## Desenvolvimento

Tudo roda em Docker, pelo `Makefile` em `app/`. Pré-requisitos: Docker com Compose e `make`.

```bash
cd app
make infra      # builda a imagem e sobe o serviço dev e o WireMock (testes)
make install    # instala as dependências dentro do serviço dev
make run        # servidor de desenvolvimento em http://localhost:5173
make validate   # fmt, lint, test, cover (mínimo 90%), it e bdd
make build      # gera o bundle de produção
make down       # derruba os containers
```

O `make run` encaminha `/api` para a API. Suba antes a API (`make infra && make init && make run`
no repositório `pirometros-api`), que publica a porta 8000 do host. Para apontar para outro
endereço, defina `API_PROXY_TARGET` (veja `app/.env.example`).

Os alvos `it` e `bdd` usam o WireMock do compose para simular a API.

### Tipos da API

Os tipos de `app/adapters/clients/api-schema.d.ts` são gerados do OpenAPI da FastAPI. Com a
API no ar, para regenerar:

```bash
cd app
make api-types                                   # lê http://host.docker.internal:8000/api/openapi.json
make api-types http://outro-host:8000/api/openapi.json   # ou informe a URL (ou um arquivo)
```

### shadcn/ui

Os componentes ficam em `app/adapters/presenters/ui/` (código copiado, não é biblioteca) e
não entram na cobertura. Para adicionar outro: `npx shadcn@latest add <componente>` dentro do
serviço dev (o `components.json` já aponta para as pastas do padrão).

## Variáveis de ambiente

Todas são lidas **em tempo de execução**: trocar de ambiente não exige rebuild da imagem.
Veja `app/.env.example`.

| Variável | Onde | Padrão | Descrição |
|---|---|---|---|
| `API_URL` | produção (nginx) | `http://pirometros-api:8000` | endereço interno da API; o nginx faz proxy de `/api` para ele. Sem barra final e sem caminho |
| `DNS_RESOLVER` | produção (nginx) | `127.0.0.11` | resolver de DNS do nginx (DNS embutido do Docker/Swarm) |
| `API_PROXY_TARGET` | desenvolvimento (Vite) | `http://host.docker.internal:8000` | para onde o servidor de desenvolvimento encaminha `/api` |

A imagem de produção aplica `envsubst` em `nginx/default.conf.template` (mecanismo da imagem
oficial do nginx).

## Deploy no Easypanel

O código, o `Dockerfile` e o compose ficam dentro de `app/`. Crie um **App** no Easypanel:

1. **Fonte**: GitHub, repositório `Rei-Auto-Parts/pirometros-web`, branch `main`.
2. **Build**: tipo *Dockerfile*, **caminho de build** `/app` (a pasta `app/` do repositório) e
   arquivo `Dockerfile`. O Dockerfile tem as stages `dev` (só desenvolvimento), `build` e
   `prod`; a última, `prod`, é a que o Easypanel constrói por padrão: nginx servindo o bundle.
3. **Ambiente**: defina `API_URL` com o endereço interno do app da API no Easypanel, por
   exemplo `http://<projeto>_pirometros-api:8000` (o nome é o do serviço na rede interna).
4. **Rede**: porta do app `80`; é este app que recebe o domínio/porta de acesso da rede da
   empresa. A API não precisa de domínio público.

Mudou a API de lugar? Altere `API_URL` e reinicie o app; não é preciso rebuildar.
