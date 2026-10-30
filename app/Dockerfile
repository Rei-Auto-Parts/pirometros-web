# Stages sobre a mesma base de Node: `dev` (ferramentas de qualidade, codigo montado por
# volume, usada pelo compose), `build` (gera o bundle) e `prod`, a ultima, que o Easypanel
# constroi por padrao: nginx servindo o bundle e fazendo proxy de /api para a API.
FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS dev

RUN apt-get update \
    && apt-get install -y --no-install-recommends make git python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install || true
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS build

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS prod

# O endereco da API e lido em tempo de execucao: a imagem oficial aplica `envsubst` nos
# arquivos de /etc/nginx/templates e grava o resultado em /etc/nginx/conf.d.
ENV API_URL=http://pirometros-api:8000 \
    DNS_RESOLVER=127.0.0.11

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
