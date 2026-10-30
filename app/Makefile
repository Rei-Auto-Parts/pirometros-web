SHELL := /bin/bash
COMPOSE ?= docker compose
DEV ?= dev
EXEC := $(COMPOSE) exec -T $(DEV)
COVERAGE_MIN ?= 90
ARG = $(filter-out $@,$(MAKECMDGOALS))

.PHONY: infra install init fmt lint test cover it bdd validate run build api-types down ps logs help
.DEFAULT_GOAL := help

%:
	@:

help: ## lista os alvos do contrato de operacao
	@grep -E '^[a-z-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  %-10s %s\n", $$1, $$2}'

infra: ## builda a imagem e sobe todos os servicos do compose
	$(COMPOSE) build
	$(COMPOSE) up -d

install: ## instala dependencias dentro do servico dev
	$(EXEC) npm ci || $(EXEC) npm install

init: ## inicializa a infraestrutura local
	$(EXEC) python3 scripts/init_infra.py

fmt: ## formata o codigo
	$(EXEC) npx prettier --write $(if $(ARG),$(ARG),.)

lint: ## analise estatica
	$(EXEC) npx eslint $(if $(ARG),$(ARG),.)
	$(EXEC) npx tsc --noEmit

build: ## gera o bundle de producao
	$(EXEC) npm run build

test: ## testes unitarios
	$(EXEC) npx vitest run $(if $(ARG),tests/unit/$(ARG),tests/unit)

cover: ## cobertura em HTML com portao minimo
	$(EXEC) npx vitest run tests/unit --coverage --coverage.reporter=html --coverage.reporter=json-summary --coverage.reporter=text
	$(EXEC) node -e "const s=require('./coverage/coverage-summary.json').total;console.log(s.lines.pct)" | python3 scripts/coverage_gate.py --min $(COVERAGE_MIN)

it: ## testes de integracao
	$(EXEC) npx vitest run tests/it

bdd: ## testes BDD ponta a ponta
	$(EXEC) sh -c "NODE_OPTIONS='--import tsx' npx cucumber-js $(if $(ARG),tests/bdd/$(ARG),tests/bdd)"

validate: ## pipeline completa de qualidade
	$(MAKE) fmt && $(MAKE) lint && $(MAKE) test && $(MAKE) cover && $(MAKE) it && $(MAKE) bdd

run: ## sobe o servidor de desenvolvimento dentro do servico dev
	$(EXEC) npm run dev -- --host 0.0.0.0

api-types: ## regenera os tipos da API a partir do OpenAPI (API no ar; make api-types http://host:porta/api/openapi.json)
	$(EXEC) npm run api:types -- $(ARG)

down: ## derruba os containers
	$(COMPOSE) down $(ARG)

ps: ## lista os servicos em execucao
	$(COMPOSE) ps

logs: ## acompanha os logs
	$(COMPOSE) logs -f $(ARG)
