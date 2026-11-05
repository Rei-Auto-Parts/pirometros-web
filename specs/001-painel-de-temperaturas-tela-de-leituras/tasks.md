# Tarefas — Painel de temperaturas (Acompanhamento, Leituras e Saúde do sistema)

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova.
>
> **Como ler**: um grupo de tarefas `[P]` **consecutivas** pode rodar em paralelo entre si; uma
> tarefa sem `[P]` separa os grupos e roda sozinha, depois do grupo anterior. Dentro de um par
> teste → implementação, o teste vem primeiro e as duas tarefas ficam com o mesmo subagente.
> Arquivos só de tipo, constante ou interface (sem comportamento) não têm teste, como no plano.
> Todo comando roda por `make`, dentro do serviço `dev`.
>
> **Pré-requisitos fora deste repositório**: a RF-14 depende de a `pirometros-api` excluir leituras
> sem temperatura (ver memória do projeto e Riscos do plano). Sem isso o front passa nos testes
> com API simulada, mas a lista real mostraria essas leituras.


## Fase 1 — Domínio

- [x] T001 Constantes (tipos e valores puros, sem comportamento, por isso sem teste): em `app/core/domain/constants/text-keys.constants.ts` as chaves de menu (itens Acompanhamento, Leituras, Saúde do sistema; recolher e expandir), tema, filtros (pirômetro, "Todos"), período (início, fim, consultar, aviso de início posterior ao fim), tabela (colunas, "—"), paginação, estados (carregando, "nenhuma leitura no período", "nenhuma leitura hoje", dados indisponíveis, tentar de novo); em `app/core/domain/constants/routes.constants.ts` `monitoring: '/'`, `readings: '/leituras'`, `health: '/saude'` (o `home` antigo só sai na tarefa de `web-entry`); em `app/core/domain/constants/query-keys.constants.ts` `pyrometers`, `readings`, `series`; criar `app/core/domain/constants/readings.constants.ts` com `READINGS_PAGE_SIZE = 50` e `REFRESH_INTERVAL_MS = 300_000`
- [x] T002 Teste unitário de `i18n.tool` em `app/tests/unit/infra/tools/i18n.tool.spec.ts` (alterar: toda chave nova tem texto pt-BR; `homeTitle` e `homeDescription` passam a ser da Saúde do sistema). Fica nesta fase porque `Record<TextKey, string>` quebra o `make lint` enquanto faltar texto
- [x] T003 Implementar os textos pt-BR das chaves novas em `app/infra/tools/i18n.tool.ts`
- [x] T004 DTOs (tipos puros, sem teste): criar `app/core/domain/dtos/reading.dto.ts`, `app/core/domain/dtos/readings-page.dto.ts`, `app/core/domain/dtos/pyrometer.dto.ts`, `app/core/domain/dtos/pyrometer-series.dto.ts` e `app/core/domain/dtos/reading-period.dto.ts`
- [x] T005 [P] Teste unitário de `ReadingsUnavailableError` em `app/tests/unit/core/domain/errors/readings-unavailable.error.spec.ts`
- [x] T006 [P] Implementar `ReadingsUnavailableError` em `app/core/domain/errors/readings-unavailable.error.ts`
- [x] T007 [P] Teste unitário de `reg-date.model` (formatar `dd/MM/yyyy HH:mm` sem segundos por fatiamento de texto, segundos do dia, rótulo `HH:mm`, fim do minuto `:59`, sem `Date`) em `app/tests/unit/core/domain/models/reg-date.model.spec.ts`
- [x] T008 [P] Implementar `reg-date.model` (formatar `dd/MM/yyyy HH:mm` sem segundos por fatiamento de texto, segundos do dia, rótulo `HH:mm`, fim do minuto `:59`, sem `Date`) em `app/core/domain/models/reg-date.model.ts`
- [x] T009 [P] Teste unitário de `reading-period.model` (dia de hoje 00:00–23:59:59 pelos getters locais, `isPeriodValid` comparando textos) em `app/tests/unit/core/domain/models/reading-period.model.spec.ts`
- [x] T010 [P] Implementar `reading-period.model` (dia de hoje 00:00–23:59:59 pelos getters locais, `isPeriodValid` comparando textos) em `app/core/domain/models/reading-period.model.ts`
- [x] T011 Interfaces (abstrações, sem teste): criar `app/interfaces/adapters/clients/i-readings.client.ts`, `app/interfaces/adapters/clients/i-pyrometers.client.ts`, `app/interfaces/core/application/i-list-readings.use-case.ts`, `app/interfaces/core/application/i-get-readings-series.use-case.ts` e `app/interfaces/core/application/i-list-pyrometers.use-case.ts`
- [x] T012 Copiar do registro do shadcn/ui, sem lógica própria (fora da cobertura, P6): `app/adapters/presenters/ui/button.tsx`, `app/adapters/presenters/ui/input.tsx`, `app/adapters/presenters/ui/table.tsx`, `app/adapters/presenters/ui/alert.tsx`
- [x] T013 Conferir que `app/adapters/clients/api-schema.d.ts` traz `/api/readings`, `/api/readings/series` e `/api/pyrometers` (gerado com `make api-types` em 2026-11-04 com a API no ar; regerar se o contrato mudar, nunca editar à mão)

## Fase 2 — Aplicação

- [x] T014 [P] Teste unitário de `ListReadingsUseCase` (período `null` = hoje resolvido a cada chamada; fim explícito vira `:59`; repassa `dev_id` e página; não engole `ReadingsUnavailableError`) em `app/tests/unit/core/application/list-readings.use-case.spec.ts`
- [x] T015 [P] Implementar `ListReadingsUseCase` (período `null` = hoje resolvido a cada chamada; fim explícito vira `:59`; repassa `dev_id` e página; não engole `ReadingsUnavailableError`) em `app/core/application/list-readings.use-case.ts`
- [x] T016 [P] Teste unitário de `GetReadingsSeriesUseCase` (sempre o dia de hoje resolvido a cada chamada; filtro opcional por pirômetro; descarta pontos com temperatura nula) em `app/tests/unit/core/application/get-readings-series.use-case.spec.ts`
- [x] T017 [P] Implementar `GetReadingsSeriesUseCase` (sempre o dia de hoje resolvido a cada chamada; filtro opcional por pirômetro; descarta pontos com temperatura nula) em `app/core/application/get-readings-series.use-case.ts`
- [x] T018 [P] Teste unitário de `ListPyrometersUseCase` em `app/tests/unit/core/application/list-pyrometers.use-case.spec.ts`
- [x] T019 [P] Implementar `ListPyrometersUseCase` em `app/core/application/list-pyrometers.use-case.ts`

## Fase 3 — Adapters e infra

- [x] T020 [P] Teste unitário de `ReadingsClient` (`/api/readings` e `/api/readings/series`, `snake_case` para DTO, falha de rede e HTTP não-2xx viram `ReadingsUnavailableError`, base `/api`) em `app/tests/unit/adapters/clients/readings.client.spec.ts`
- [x] T021 [P] Implementar `ReadingsClient` (`/api/readings` e `/api/readings/series`, `snake_case` para DTO, falha de rede e HTTP não-2xx viram `ReadingsUnavailableError`, base `/api`) em `app/adapters/clients/readings.client.ts`
- [x] T022 [P] Teste unitário de `PyrometersClient` (`/api/pyrometers`, mesmo tratamento de erro, base `/api`) em `app/tests/unit/adapters/clients/pyrometers.client.spec.ts`
- [x] T023 [P] Implementar `PyrometersClient` (`/api/pyrometers`, mesmo tratamento de erro, base `/api`) em `app/adapters/clients/pyrometers.client.ts`
- [x] T024 Teste unitário de `AppDependencies` em `app/tests/unit/adapters/presenters/dependencies/AppDependencies.spec.tsx` (alterar: expõe os três casos de uso novos e mantém `getHealthUseCase`)
- [x] T025 Implementar os três casos de uso novos em `app/adapters/presenters/dependencies/AppDependencies.tsx`
- [x] T026 [P] Teste unitário de `usePyrometers` em `app/tests/unit/adapters/presenters/hooks/usePyrometers.spec.tsx`
- [x] T027 [P] Implementar `usePyrometers` em `app/adapters/presenters/hooks/usePyrometers.ts`
- [x] T028 [P] Teste unitário de `useReadings` (`refetchInterval` de 5 min; `queryKey` com pirômetro, período e página, sem a data de hoje; teste com relógio falso) em `app/tests/unit/adapters/presenters/hooks/useReadings.spec.tsx`
- [x] T029 [P] Implementar `useReadings` (`refetchInterval` de 5 min; `queryKey` com pirômetro, período e página, sem a data de hoje; teste com relógio falso) em `app/adapters/presenters/hooks/useReadings.ts`
- [x] T030 [P] Teste unitário de `useReadingsSeries` (`refetchInterval` de 5 min; teste com relógio falso) em `app/tests/unit/adapters/presenters/hooks/useReadingsSeries.spec.tsx`
- [x] T031 [P] Implementar `useReadingsSeries` (`refetchInterval` de 5 min; teste com relógio falso) em `app/adapters/presenters/hooks/useReadingsSeries.ts`
- [x] T032 [P] Teste unitário de `useTheme` (abre no claro; alterna a classe `dark` no `<html>`; sem persistência) em `app/tests/unit/adapters/presenters/hooks/useTheme.spec.tsx`
- [x] T033 [P] Implementar `useTheme` (abre no claro; alterna a classe `dark` no `<html>`; sem persistência) em `app/adapters/presenters/hooks/useTheme.ts`
- [x] T034 [P] Teste unitário de `StateMessage` (carregando, vazio, indisponível com "Tentar de novo") em `app/tests/unit/adapters/presenters/components/StateMessage.spec.tsx`
- [x] T035 [P] Implementar `StateMessage` (carregando, vazio, indisponível com "Tentar de novo") em `app/adapters/presenters/components/StateMessage.tsx`
- [x] T036 [P] Teste unitário de `Pagination` (anterior, próxima, "página X de Y") em `app/tests/unit/adapters/presenters/components/Pagination.spec.tsx`
- [x] T037 [P] Implementar `Pagination` (anterior, próxima, "página X de Y") em `app/adapters/presenters/components/Pagination.tsx`
- [x] T038 [P] Teste unitário de `PyrometerFilter` (select nativo, opção "Todos") em `app/tests/unit/adapters/presenters/components/PyrometerFilter.spec.tsx`
- [x] T039 [P] Implementar `PyrometerFilter` (select nativo, opção "Todos") em `app/adapters/presenters/components/PyrometerFilter.tsx`
- [x] T040 [P] Teste unitário de `PeriodFilter` (dois `datetime-local`, aviso e bloqueio quando o início é posterior ao fim) em `app/tests/unit/adapters/presenters/components/PeriodFilter.spec.tsx`
- [x] T041 [P] Implementar `PeriodFilter` (dois `datetime-local`, aviso e bloqueio quando o início é posterior ao fim) em `app/adapters/presenters/components/PeriodFilter.tsx`
- [x] T042 [P] Teste unitário de `ReadingsTable` (data `dd/MM/yyyy HH:mm`, serial quando sem nome, "—" em bateria e local ausentes) em `app/tests/unit/adapters/presenters/components/ReadingsTable.spec.tsx`
- [x] T043 [P] Implementar `ReadingsTable` (data `dd/MM/yyyy HH:mm`, serial quando sem nome, "—" em bateria e local ausentes) em `app/adapters/presenters/components/ReadingsTable.tsx`
- [x] T044 [P] Teste unitário de `TemperatureChart` (uma linha por pirômetro, eixo em `HH:mm`, dimensões fixas no teste por causa do jsdom) em `app/tests/unit/adapters/presenters/components/TemperatureChart.spec.tsx`
- [x] T045 [P] Implementar `TemperatureChart` (uma linha por pirômetro, eixo em `HH:mm`, dimensões fixas no teste por causa do jsdom) em `app/adapters/presenters/components/TemperatureChart.tsx`
- [x] T046 [P] Teste unitário de `ThemeToggle` em `app/tests/unit/adapters/presenters/components/ThemeToggle.spec.tsx`
- [x] T047 [P] Implementar `ThemeToggle` em `app/adapters/presenters/components/ThemeToggle.tsx`
- [x] T048 [P] Teste unitário de `SidebarNav` (três itens com `NavLink` e ícone, item atual destacado, modo recolhido só com ícone e nome em `aria-label`/`title`, botão recolher/expandir) em `app/tests/unit/adapters/presenters/components/SidebarNav.spec.tsx`
- [x] T049 [P] Implementar `SidebarNav` (três itens com `NavLink` e ícone, item atual destacado, modo recolhido só com ícone e nome em `aria-label`/`title`, botão recolher/expandir) em `app/adapters/presenters/components/SidebarNav.tsx`
- [x] T050 Teste unitário de `HealthPage` em `app/tests/unit/adapters/presenters/pages/HealthPage.spec.tsx` (renomear `HomePage.spec.tsx`; mesmo comportamento)
- [x] T051 [P] Renomear `app/adapters/presenters/pages/HomePage.tsx` para `app/adapters/presenters/pages/HealthPage.tsx` (componente `HealthPage`, mesmo conteúdo)
- [x] T052 [P] Teste unitário de `MonitoringPage` (gráfico de hoje, filtro por pirômetro, carregando/vazio "nenhuma leitura hoje"/indisponível) em `app/tests/unit/adapters/presenters/pages/MonitoringPage.spec.tsx`
- [x] T053 [P] Implementar `MonitoringPage` (gráfico de hoje, filtro por pirômetro, carregando/vazio "nenhuma leitura hoje"/indisponível) em `app/adapters/presenters/pages/MonitoringPage.tsx`
- [x] T054 [P] Teste unitário de `ReadingsPage` (período `null` = hoje, período explícito ao consultar, filtro, paginação, carregando/vazio/indisponível, refresh mantém filtro, período e página) em `app/tests/unit/adapters/presenters/pages/ReadingsPage.spec.tsx`
- [x] T055 [P] Implementar `ReadingsPage` (período `null` = hoje, período explícito ao consultar, filtro, paginação, carregando/vazio/indisponível, refresh mantém filtro, período e página) em `app/adapters/presenters/pages/ReadingsPage.tsx`
- [x] T056 Teste unitário de `AppLayout` em `app/tests/unit/adapters/presenters/layout/AppLayout.spec.tsx` (alterar: menu com os três itens, estado recolhido mantido ao trocar de rota, `ThemeToggle` presente)
- [x] T057 Implementar `app/adapters/presenters/layout/AppLayout.tsx` (usa `SidebarNav`, guarda recolhido/expandido em `useState` começando expandido, inclui `ThemeToggle`)
- [x] T058 Acrescentar os tokens `.dark { … }` em `app/adapters/presenters/styles/globals.css` (CSS, sem teste; fora do Prettier não, formatar)
- [x] T059 Teste unitário de `WebEntry` em `app/tests/unit/infra/web/web-entry.spec.tsx` (alterar: rotas `/` Acompanhamento, `/leituras` Leituras e `/saude` Saúde do sistema)
- [x] T060 Implementar as três rotas em `app/infra/web/web-entry.tsx` e remover `home` de `app/core/domain/constants/routes.constants.ts`
- [x] T061 Ligar clients e casos de uso novos em `app/infra/init/ioc.init.tsx` (fora da cobertura, como `ioc_init`)

## Fase 4 — Integração e BDD

- [x] T062 Teste de integração de `ReadingsClient` em `app/tests/it/adapters/clients/readings.client.spec.ts` (contra o WireMock: página, série e API indisponível)
- [x] T063 Teste de integração de `PyrometersClient` em `app/tests/it/adapters/clients/pyrometers.client.spec.ts`
- [x] T064 Mapeamentos WireMock: `app/tests/it/wiremock/mappings/pyrometers.json`, `app/tests/it/wiremock/mappings/readings.json`, `app/tests/it/wiremock/mappings/readings-series.json` e `app/tests/it/wiremock/mappings/readings-unavailable.json`
- [x] T065 Alterar `app/tests/bdd/saude-do-sistema.feature` e `app/tests/bdd/steps/saude-do-sistema.steps.tsx` para abrir a Saúde do sistema na rota `/saude` e usar `HealthPage`; remover o cenário "Menu lateral vazio"
- [x] T066 Criar `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx` e `app/tests/bdd/painel-de-temperaturas.feature` (`# language: pt`) com a Funcionalidade, o contexto de API simulada por `fetch` e o relógio falso; os cenários entram nas tarefas seguintes, um por tarefa
- [x] T067 Cenário `Tela inicial é o Acompanhamento` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T068 Cenário `Navegar pelo menu lateral` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T069 Cenário `Recolher e expandir o menu lateral` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T070 Cenário `O estado do menu se mantém ao trocar de tela` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T071 Cenário `Saúde do sistema em rota própria` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T072 Cenário `Saúde do sistema com a API fora do ar` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T073 Cenário `Gráfico do dia de hoje com uma linha por pirômetro` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T074 Cenário `Filtrar o gráfico por pirômetro` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T075 Cenário `Consultar as leituras de um período` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T076 Cenário `Período inicial das Leituras é o dia de hoje` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T077 Cenário `Período longo` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T078 Cenário `Leitura que chegou atrasada fica na ordem da data` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T079 Cenário `Datas aparecem como gravadas` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T080 Cenário `Filtrar as leituras por pirômetro` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T081 Cenário `Paginar a lista` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T082 Cenário `Período sem leituras` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T083 Cenário `Acompanhamento sem leituras hoje` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T084 Cenário `API indisponível` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T085 Cenário `Alternar o tema` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T086 Cenário `Texto em português` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T087 Cenário `Leitura sem temperatura não aparece` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T088 Cenário `Pirômetro sem nome mostra o serial` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T089 Cenário `Bateria ou local ausentes` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T090 Cenário `Início posterior ao fim` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T091 Cenário `O fim do período inclui o minuto inteiro` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T092 Cenário `Carregando` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T093 Cenário `Acompanhamento se atualiza a cada 5 minutos` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T094 Cenário `Leituras se atualizam sem perder filtro, período e página` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [x] T095 Cenário `Virada do dia` em `app/tests/bdd/painel-de-temperaturas.feature` (DADO/QUANDO/ENTÃO/MAS) e os passos em `app/tests/bdd/steps/painel-de-temperaturas.steps.tsx`
- [ ] T096 Verificação manual com `make run`: tela do Acompanhamento e das Leituras com ~10.000 leituras em até 2 s (RNF-01) e sem rolagem horizontal em 1366 px (RNF-05); `make build` e conferir que o bundle em `app/dist/` não contém o endereço da API (RNF-03). Registrar o resultado em `tasks.md`/Convergence
  - Parcial (2026-11-04): `make build` ok e 0 ocorrências do endereço da API em `app/dist/` (RNF-03). Pendentes, exigem API no ar e navegador: 10.000 leituras em até 2 s (RNF-01) e sem rolagem horizontal em 1366 px (RNF-05).
- [x] T097 `make validate` verde (`fmt` → `lint` → `test` → `cover` ≥ 90% → `it` → `bdd`)

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T001, T003, T048, T049, T056, T057, T059, T060, T066, T067, T068 |
| RF-02 | T004, T007, T008, T009, T010, T011, T013, T016, T017, T020, T021, T025, T030, T031, T044, T045, T052, T053, T061, T073 |
| RF-03 | T004, T011, T016, T017, T018, T019, T022, T023, T026, T027, T038, T039, T052, T053, T063, T064, T074 |
| RF-04 | T004, T007, T008, T009, T010, T011, T012, T014, T015, T040, T041, T054, T055, T075, T076, T077, T090, T091 |
| RF-05 | T001, T004, T011, T013, T014, T015, T020, T021, T025, T028, T029, T036, T037, T042, T043, T054, T055, T061, T062, T064, T075, T077, T078, T081 |
| RF-06 | T004, T012, T042, T043, T054, T055, T075, T088, T089 |
| RF-07 | T004, T011, T014, T015, T018, T019, T026, T027, T038, T039, T054, T055, T080 |
| RF-08 | T001, T005, T006, T012, T020, T021, T022, T023, T034, T035, T052, T053, T054, T055, T062, T064, T082, T083, T084, T092 |
| RF-09 | T001, T002, T003, T007, T008, T042, T043, T044, T045, T079, T086 |
| RF-10 | T001, T032, T033, T046, T047, T056, T057, T058, T085 |
| RF-11 | T001, T003, T048, T049, T056, T057, T069, T070 |
| RF-12 | T001, T003, T024, T025, T050, T051, T059, T060, T061, T065, T071, T072 |
| RF-13 | T001, T009, T010, T014, T015, T016, T017, T028, T029, T030, T031, T052, T053, T054, T055, T093, T094, T095 |
| RF-14 | T016, T017, T054, T055, T087 |
| RNF-01 | T096 |
| RNF-02 | T007, T008, T042, T043, T079 |
| RNF-03 | T020, T021, T022, T023, T062, T063, T096 |
| RNF-04 | T097 |
| RNF-05 | T096 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-11-04

`make validate` (saída real): `fmt` ok, `lint` (eslint + tsc) ok, `test` 30 arquivos / 162 testes passando, `cover` 97,97% (mínimo 90%), `it` 3 arquivos / 7 testes passando, `bdd` 32 cenários / 184 passos passando, código de saída 0. `make build` ok, 0 ocorrências do endereço da API em `app/dist/`.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | `app/infra/web/app-routes.tsx` (3 rotas, `/` é o Acompanhamento); `SidebarNav.tsx`; BDD "Tela inicial é o Acompanhamento" e "Navegar pelo menu lateral" |
| RF-02 | realizado | `MonitoringPage.tsx`, `TemperatureChart.tsx`, `GetReadingsSeriesUseCase` (dia de hoje, todos os pontos); BDD "Gráfico do dia de hoje…". O jsdom não desenha o traço: a posição de cada ponto é conferida pelos dados entregues ao gráfico e por `reg-date.model.spec.ts`, não pelo desenho |
| RF-03 | realizado | `PyrometerFilter.tsx`, `MonitoringPage.tsx:16-25`; BDD "Filtrar o gráfico por pirômetro" |
| RF-04 | realizado | `ReadingsPage.tsx` (período inicial = hoje, fim `:59`, `PeriodFilter` bloqueia início > fim); BDD "Consultar…", "Período inicial…", "Início posterior ao fim", "O fim do período inclui o minuto inteiro" |
| RF-05 | realizado | `ReadingsTable.tsx`, `Pagination.tsx`, `READINGS_PAGE_SIZE = 50`; ordenação feita pela API (contrato). BDD "Paginar a lista", "Leitura que chegou atrasada…" (ordem vem da API simulada, que segue o contrato) |
| RF-06 | realizado | `ReadingsTable.tsx:21-30` (serial sem nome, "—" em bateria/local); BDD "Pirômetro sem nome…", "Bateria ou local ausentes". A temperatura é exibida como a API devolve, sem conversão (não arredonda: arredondar seria "corrigir valor", fora de escopo) |
| RF-07 | realizado | `ReadingsPage.tsx` + `PyrometerFilter.tsx`; BDD "Filtrar as leituras por pirômetro" |
| RF-08 | realizado | `StateMessage.tsx`; BDD "Período sem leituras", "Acompanhamento sem leituras hoje", "API indisponível", "Carregando" |
| RF-09 | realizado | `i18n.tool.ts` (pt-BR), `reg-date.model.ts` (fatiamento de texto, sem `Date`); BDD "Datas aparecem como gravadas", "Texto em português" |
| RF-10 | realizado | `useTheme.ts`, `ThemeToggle.tsx`, tokens `.dark` em `globals.css`; BDD "Alternar o tema". Só confirmei os textos e a classe `dark`, não o visual |
| RF-11 | realizado | `AppLayout.tsx` (`collapsed` em `useState`, abre expandido), `SidebarNav.tsx`; BDD "Recolher e expandir…", "O estado do menu se mantém…". Menu recolhido usa `w-16`; o ganho de largura não foi verificado no navegador |
| RF-12 | realizado | `HealthPage.tsx` em `/saude`; BDD "Saúde do sistema em rota própria" e "…com a API fora do ar" |
| RF-13 | parcial | `useReadings.ts`, `useReadingsSeries.ts` (`refetchInterval` 5 min, chave sem a data de hoje); BDD "Acompanhamento se atualiza…", "Leituras se atualizam…", "Virada do dia". Lacuna: com as Leituras já abertas na virada do dia, a consulta passa a ser do dia novo, mas os campos Início/Fim continuam mostrando o dia antigo (`ReadingsPage.tsx:23`, rascunho inicializado só na montagem). O BDD só cobre abrir as Leituras depois da virada → T098 |
| RF-14 | parcial | Front: `GetReadingsSeriesUseCase` descarta ponto sem temperatura; a lista e o total dependem de a API excluir essas leituras, o que está pendente na `pirometros-api` (ver memória do projeto). O BDD usa API simulada que já cumpre o contrato, então prova o front, não a API real |
| RNF-01 | ausente | Não medido: T096 pendente (exige API no ar e navegador) |
| RNF-02 | realizado | `reg-date.model.spec.ts`, BDD "Datas aparecem como gravadas" |
| RNF-03 | realizado | `make build`: 0 ocorrências do endereço da API em `app/dist/`; clients usam só `/api` |
| RNF-04 | realizado | `make cover`: 97,97% |
| RNF-05 | ausente | Não medido: T096 pendente |

Cenários BDD: 29 critérios de aceite da spec = 29 cenários em `app/tests/bdd/painel-de-temperaturas.feature`, mais 3 antigos de saúde em `saude-do-sistema.feature`; todos passam.

Excesso de escopo: nenhum requisito extra entregue. Itens fora do plano, ambos de apoio a teste: `app/infra/web/app-routes.tsx` (rotas extraídas do `web-entry` para os BDD usarem a mesma tabela) e a infraestrutura de BDD em `app/tests/bdd/support/` (API simulada, mundo, relógio falso, ambiente do gráfico). Nada do que a seção Fora de escopo proíbe foi encontrado.

Pendências que não são tarefa de código: revisão humana dos 4 checklists (todos desmarcados) e a exclusão de leitura sem temperatura na `pirometros-api`.

Veredito: não convergido
Tarefas acrescentadas: T098

- [ ] T098 Fazer os campos Início e Fim das Leituras acompanharem a virada do dia enquanto o usuário não escolheu outro período (`app/adapters/presenters/pages/ReadingsPage.tsx`); teste unitário em `app/tests/unit/adapters/presenters/pages/ReadingsPage.spec.tsx` com relógio falso e cenário BDD "Virada do dia" estendido para as Leituras já abertas
