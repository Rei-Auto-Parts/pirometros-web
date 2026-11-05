# Tarefas — Gestão de pirômetros, cards de visão geral e gráfico melhorado

> Ordem de dependência. `[P]` marca tarefa paralelizável (não toca arquivo de outra `[P]`
> da mesma fase). Teste vem antes da implementação que ele prova.
> Todo caminho é relativo a `pirometros-web/`; comandos só por `make`, no serviço `dev`.
> `/bu:checklist` foi pulado por pedido do usuário ("sem enrolação").

## Fase 1 — Domínio, texto e interfaces
- [x] T001 Regenerar os tipos da API com `make api-types http://host.docker.internal:8000/api/openapi.json` em `app/adapters/clients/api-schema.d.ts` (gerado; nunca editar à mão)
- [x] T002 [P] Teste unitário da paleta (12 cores distintas, mesma ordem da API) e dos limites em `app/tests/unit/core/domain/constants/pyrometer-profile.constants.spec.ts`
- [x] T003 Criar `app/core/domain/constants/pyrometer-profile.constants.ts` (paleta com chave de nome por cor, apelido 40, observação 500)
- [x] T004 [P] Teste unitário dos cinco períodos (ordem, `today` padrão) em `app/tests/unit/core/domain/constants/chart-periods.constants.spec.ts`
- [x] T005 Criar `app/core/domain/constants/chart-periods.constants.ts`
- [x] T006 [P] Criar os DTOs `app/core/domain/dtos/pyrometer-summary.dto.ts` e `app/core/domain/dtos/pyrometer-profile.dto.ts` e estender `app/core/domain/dtos/pyrometer.dto.ts` (apelido, cor, observação, ativo)
- [x] T007 [P] Teste unitário de `ProfileRejectedError` em `app/tests/unit/core/domain/errors/profile-rejected.error.spec.ts`
- [x] T008 Criar `app/core/domain/errors/profile-rejected.error.ts`
- [x] T009 Teste unitário do nome mostrado, dos ativos e da ordem alfabética em `app/tests/unit/core/domain/models/pyrometer-name.model.spec.ts`
- [x] T010 Criar `app/core/domain/models/pyrometer-name.model.ts`
- [x] T011 Teste unitário da janela de cada período (1 h, 6 h, 24 h, hoje, 3 dias; virada de dia e de ano) em `app/tests/unit/core/domain/models/chart-period.model.spec.ts`
- [x] T012 Criar `app/core/domain/models/chart-period.model.ts`
- [x] T013 Teste unitário de `toEpochSeconds` e `formatEpoch` (bissexto 29/02/2028, virada de ano, sem `Date`) em `app/tests/unit/core/domain/models/reg-date.model.spec.ts`
- [x] T014 Alterar `app/core/domain/models/reg-date.model.ts` (`toEpochSeconds`, `formatEpoch`; remover o que ficar sem uso)
- [x] T015 Teste unitário do eixo (domínio, ticks, rótulo com e sem data) em `app/tests/unit/core/domain/models/chart-axis.model.spec.ts`
- [x] T016 Criar `app/core/domain/models/chart-axis.model.ts`
- [x] T017 Teste unitário da lacuna (exatamente 900 s não quebra; 901 s quebra; um ponto; vazio) em `app/tests/unit/core/domain/models/series-gap.model.spec.ts`
- [x] T018 Criar `app/core/domain/models/series-gap.model.ts` e a constante `SERIES_GAP_SECONDS` em `app/core/domain/constants/readings.constants.ts`
- [x] T019 Teste unitário da divisão de minutos em horas e minutos em `app/tests/unit/core/domain/models/duration.model.spec.ts`
- [x] T020 Criar `app/core/domain/models/duration.model.ts`
- [x] T021 Teste unitário de que toda chave de texto tem texto em português (inclui os novos) em `app/tests/unit/infra/tools/i18n.tool.spec.ts`
- [x] T022 Alterar `app/core/domain/constants/text-keys.constants.ts`, `app/infra/tools/i18n.tool.ts`, `app/core/domain/constants/routes.constants.ts` (`/pirometros`) e `app/core/domain/constants/query-keys.constants.ts` (resumo)
- [x] T023 Criar `app/interfaces/core/application/i-list-pyrometer-summaries.use-case.ts` e `app/interfaces/core/application/i-save-pyrometer-profile.use-case.ts`; alterar `app/interfaces/adapters/clients/i-pyrometers.client.ts` (`listSummaries`, `saveProfile`) e `app/interfaces/core/application/i-get-readings-series.use-case.ts` (chave do período)

## Fase 2 — Aplicação

- [x] T024 [P] Teste unitário de `ListPyrometerSummariesUseCase` em `app/tests/unit/core/application/list-pyrometer-summaries.use-case.spec.ts`
- [x] T025 Criar `app/core/application/list-pyrometer-summaries.use-case.ts` (depende de T023, T024)
- [x] T026 [P] Teste unitário de `SavePyrometerProfileUseCase` (repassa; propaga `ProfileRejectedError`) em `app/tests/unit/core/application/save-pyrometer-profile.use-case.spec.ts`
- [x] T027 Criar `app/core/application/save-pyrometer-profile.use-case.ts` (depende de T023, T026)
- [x] T028 Teste unitário de `GetReadingsSeriesUseCase` com período (padrão `today`, os cinco períodos) em `app/tests/unit/core/application/get-readings-series.use-case.spec.ts`
- [x] T029 Alterar `app/core/application/get-readings-series.use-case.ts` (depende de T012, T023, T028)

## Fase 3 — Clients e dependências

- [x] T030 Teste unitário de `PyrometersClient` (lista estendida, resumo, `PUT` ok/404/422/rede) em `app/tests/unit/adapters/clients/pyrometers.client.spec.ts`
- [x] T031 Alterar `app/adapters/clients/fetch-json.ts` (`sendJson`) e `app/adapters/clients/pyrometers.client.ts` (depende de T001, T006, T008, T030)
- [x] T032 Teste unitário do provedor de dependências com os novos casos de uso em `app/tests/unit/adapters/presenters/dependencies/AppDependencies.spec.tsx`
- [x] T033 Alterar `app/adapters/presenters/dependencies/AppDependencies.tsx` e `app/tests/unit/adapters/presenters/test-render.tsx` (depende de T023, T032)

## Fase 4 — Apresentação

- [x] T034 [P] Teste unitário de `usePyrometerSummaries` em `app/tests/unit/adapters/presenters/hooks/usePyrometerSummaries.spec.tsx`
- [x] T035 Criar `app/adapters/presenters/hooks/usePyrometerSummaries.ts` (atualiza a cada 5 min)
- [x] T036 [P] Teste unitário de `useSavePyrometer` (invalida a lista ao salvar) em `app/tests/unit/adapters/presenters/hooks/useSavePyrometer.spec.tsx`
- [x] T037 Criar `app/adapters/presenters/hooks/useSavePyrometer.ts`
- [x] T038 Teste unitário de `useReadingsSeries` com período em `app/tests/unit/adapters/presenters/hooks/useReadingsSeries.spec.tsx`
- [x] T039 Alterar `app/adapters/presenters/hooks/useReadingsSeries.ts`
- [x] T040 [P] Teste unitário de `ColorPicker` (12 opções, marca a atual, escolhe) em `app/tests/unit/adapters/presenters/components/ColorPicker.spec.tsx`
- [x] T041 Criar `app/adapters/presenters/components/ColorPicker.tsx`
- [x] T042 Teste unitário de `PyrometerProfileForm` (salva, confirma, erro preserva o digitado, limites) em `app/tests/unit/adapters/presenters/components/PyrometerProfileForm.spec.tsx`
- [x] T043 Criar `app/adapters/presenters/components/PyrometerProfileForm.tsx` (depende de T037, T041, T042)
- [x] T044 [P] Teste unitário de `Sparkline` em `app/tests/unit/adapters/presenters/components/Sparkline.spec.tsx`
- [x] T045 Criar `app/adapters/presenters/components/Sparkline.tsx`
- [x] T046 Teste unitário de `PyrometerCard` (campos, `3 min`, `1 h 05 min`, `10 h`, sem leitura, selecionado, sem variação por tempo ou bateria) em `app/tests/unit/adapters/presenters/components/PyrometerCard.spec.tsx`
- [x] T047 Criar `app/adapters/presenters/components/PyrometerCard.tsx` (depende de T020, T045, T046)
- [x] T048 Teste unitário de `PyrometerCards` (ordem alfabética, só ativos, grid sem rolagem horizontal) em `app/tests/unit/adapters/presenters/components/PyrometerCards.spec.tsx`
- [x] T049 Criar `app/adapters/presenters/components/PyrometerCards.tsx` (depende de T010, T047, T048)
- [x] T050 [P] Teste unitário de `ChartPeriodSelect` em `app/tests/unit/adapters/presenters/components/ChartPeriodSelect.spec.tsx`
- [x] T051 Criar `app/adapters/presenters/components/ChartPeriodSelect.tsx`
- [x] T052 Teste unitário de `TemperatureChart` (período, cor, nome mostrado, lacuna, desempenho 10 pirômetros × 10.000 pontos) em `app/tests/unit/adapters/presenters/components/TemperatureChart.spec.tsx`
- [x] T053 Alterar `app/adapters/presenters/components/TemperatureChart.tsx` (depende de T014, T016, T018)
- [x] T054 [P] Teste unitário de `PyrometerFilter` com apelido e inativo em `app/tests/unit/adapters/presenters/components/PyrometerFilter.spec.tsx`
- [x] T055 Alterar `app/adapters/presenters/components/PyrometerFilter.tsx`
- [x] T056 [P] Teste unitário de `ReadingsTable` com nome mostrado em `app/tests/unit/adapters/presenters/components/ReadingsTable.spec.tsx`
- [x] T057 Alterar `app/adapters/presenters/components/ReadingsTable.tsx`
- [x] T058 [P] Teste unitário de `SidebarNav` com 4 itens em `app/tests/unit/adapters/presenters/components/SidebarNav.spec.tsx`
- [x] T059 Alterar `app/adapters/presenters/components/SidebarNav.tsx`
- [x] T060 Teste unitário de `PyrometersPage` (lista todos, sem criar/excluir, estados) em `app/tests/unit/adapters/presenters/pages/PyrometersPage.spec.tsx`
- [x] T061 Criar `app/adapters/presenters/pages/PyrometersPage.tsx` (depende de T043, T060)
- [x] T062 Teste unitário de `MonitoringPage` (cards, filtro sincronizado, período, estado único, só ativos) em `app/tests/unit/adapters/presenters/pages/MonitoringPage.spec.tsx`
- [x] T063 Alterar `app/adapters/presenters/pages/MonitoringPage.tsx` (depende de T035, T039, T049, T051, T053, T055, T062)
- [x] T064 Teste unitário de `ReadingsPage` com inativos no filtro em `app/tests/unit/adapters/presenters/pages/ReadingsPage.spec.tsx`
- [x] T065 Alterar `app/adapters/presenters/pages/ReadingsPage.tsx`
- [x] T066 Alterar `app/infra/web/app-routes.tsx` e `app/infra/init/ioc.init.tsx` (rota `/pirometros`, novos casos de uso) (depende de T027, T029, T031, T061)

## Fase 5 — Integração e BDD

- [x] T067 Alterar `app/tests/it/wiremock/mappings/pyrometers.json`, criar `app/tests/it/wiremock/mappings/pyrometer-summary.json` e `app/tests/it/wiremock/mappings/pyrometer-save.json`, e alterar `app/tests/it/adapters/clients/pyrometers.client.spec.ts` (resumo e `PUT`)
- [x] T068 Alterar `app/tests/bdd/support/fake-api.ts` e `app/tests/bdd/support/painel-world.tsx` (contrato novo: complemento, resumo, `PUT`, minutos sem leitura; novos casos de uso)
- [x] T069 Alterar `app/tests/bdd/steps/graficos.steps.tsx`, `app/tests/bdd/steps/navegacao.steps.tsx` e `app/tests/bdd/painel-de-temperaturas.feature` (janela do gráfico × miniatura; menu com 4 itens)
- [x] T070 Criar `app/tests/bdd/gestao-de-pirometros.feature` (`# language: pt`) e `app/tests/bdd/steps/gestao-de-pirometros.steps.tsx`, com um cenário por critério de aceite, nas tarefas T071 a T086 (mesmos arquivos: não paralelizar)
- [x] T071 Cenário `Menu com Pirômetros` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T072 Cenário `Listar pirômetros` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T073 Cenário `Editar apelido, cor e observação` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T074 Cenário `Novo apelido aparece em todo lugar` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T075 Cenário `Nome sem apelido` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T076 Cenário `Erro ao salvar preserva o que foi digitado` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T077 Cenário `Inativar pirômetro` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T078 Cenário `Não há como criar pirômetro` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T079 Cenário `Card por pirômetro ativo` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T080 Cenário `Tempo sem leitura é só informação` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T081 Cenário `Escolher cor da paleta` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T082 Cenário `Clicar no card filtra o gráfico` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T083 Cenário `Escolher período do gráfico` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T084 Cenário `Lacuna aparece no gráfico` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T085 Cenário `Cor do pirômetro` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T086 Cenário `API indisponível` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T087 `make validate` verde (fmt → lint → test → cover ≥ 90% → it → bdd)

## Fase 6 — Emendas de 2026-11-05 (RF-04 substituído, RF-15, RF-16)

- [x] T088 Teste unitário do nome "TAG - APELIDO" (com e sem apelido, sem nome do aparelho, ordem) em `app/tests/unit/core/domain/models/pyrometer-name.model.spec.ts`
- [x] T089 Alterar `app/core/domain/models/pyrometer-name.model.ts`
- [x] T090 Teste unitário de `colorsInUse` (cor efetiva dos outros, sem o próprio, caixa) em `app/tests/unit/core/domain/models/pyrometer-color.model.spec.ts`
- [x] T091 Criar `app/core/domain/models/pyrometer-color.model.ts`
- [x] T092 Teste unitário do 409 (`ProfileRejectedError(409)`) em `app/tests/unit/adapters/clients/pyrometers.client.spec.ts`
- [x] T093 Alterar `app/adapters/clients/fetch-json.ts` (409) e as chaves de texto em `app/core/domain/constants/text-keys.constants.ts` e `app/infra/tools/i18n.tool.ts` (depende de T092)
- [x] T094 Teste unitário de `ColorPicker` (cor em uso desabilitada com "em uso por …"; a própria continua selecionável) em `app/tests/unit/adapters/presenters/components/ColorPicker.spec.tsx`
- [x] T095 Alterar `app/adapters/presenters/components/ColorPicker.tsx` (depende de T091, T094)
- [x] T096 Teste unitário de `PyrometerProfileForm` (mensagem do 409 e valor preservado; cores em uso) em `app/tests/unit/adapters/presenters/components/PyrometerProfileForm.spec.tsx` e de `PyrometersPage` em `app/tests/unit/adapters/presenters/pages/PyrometersPage.spec.tsx`
- [x] T097 Alterar `app/adapters/presenters/components/PyrometerProfileForm.tsx` e `app/adapters/presenters/pages/PyrometersPage.tsx` (depende de T093, T095, T096)
- [x] T098 Teste unitário da grade compacta (2/3/4 colunas) em `app/tests/unit/adapters/presenters/components/PyrometerCards.spec.tsx`
- [x] T099 Alterar `app/adapters/presenters/components/PyrometerCards.tsx` e `PyrometerCard.tsx` (compacto)
- [x] T100 Alterar `app/tests/it/wiremock/mappings/pyrometer-save.json` e `app/tests/it/adapters/clients/pyrometers.client.spec.ts` (409)
- [x] T101 Alterar `app/tests/bdd/support/fake-api.ts` (409) e os passos e a feature existentes para "TAG - APELIDO" em `app/tests/bdd/gestao-de-pirometros.feature` e `app/tests/bdd/steps/gestao-de-pirometros.steps.tsx`
- [x] T102 Cenário `Cor em uso por outro pirômetro fica indisponível` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T103 Cenário `API recusa cor já em uso` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T104 Cenário `Cards lado a lado` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T105 `make validate` verde

## Fase 7 — Emenda de 2026-11-05: redesenho da tela Pirômetros (RF-02, RF-03, RF-17 a RF-19)

- [x] T106 Teste unitário de `displayParts` (TAG e apelido separados) em `app/tests/unit/core/domain/models/pyrometer-name.model.spec.ts`
- [x] T107 Alterar `app/core/domain/models/pyrometer-name.model.ts` (`displayParts`) e as chaves de texto em `app/core/domain/constants/text-keys.constants.ts` e `app/infra/tools/i18n.tool.ts`
- [x] T108 Teste unitário do `Switch` em `app/tests/unit/adapters/presenters/components/Switch.spec.tsx`
- [x] T109 Criar `app/adapters/presenters/components/Switch.tsx`
- [x] T110 Teste unitário do `ColorPicker` (grade 6×2, setas, sinal de escolhido, risco, texto da cor) em `app/tests/unit/adapters/presenters/components/ColorPicker.spec.tsx`
- [x] T111 Alterar `app/adapters/presenters/components/ColorPicker.tsx`
- [x] T112 Teste unitário de `PyrometerList` (linha, destaque, `aria-selected`, atenuado, observação truncada, teclado) em `app/tests/unit/adapters/presenters/components/PyrometerList.spec.tsx`
- [x] T113 Criar `app/adapters/presenters/components/PyrometerList.tsx`
- [x] T114 Teste unitário de `PyrometerEditPanel` (contadores, salvar/descartar por alteração, aviso, 409/422, confirmação) em `app/tests/unit/adapters/presenters/components/PyrometerEditPanel.spec.tsx`
- [x] T115 Criar `app/adapters/presenters/components/PyrometerEditPanel.tsx` e remover `app/adapters/presenters/components/PyrometerProfileForm.tsx` e `app/tests/unit/adapters/presenters/components/PyrometerProfileForm.spec.tsx` (depende de T109, T111, T114)
- [x] T116 Teste unitário de `PyrometersPage` (duas colunas, seleção padrão, troca bloqueada com alteração, sem `max-w` estreito, estados) em `app/tests/unit/adapters/presenters/pages/PyrometersPage.spec.tsx`
- [x] T117 Alterar `app/adapters/presenters/pages/PyrometersPage.tsx` (depende de T113, T115, T116)
- [x] T118 Alterar os passos e a feature existentes da tela Pirômetros (selecionar na lista antes de editar) em `app/tests/bdd/gestao-de-pirometros.feature` e `app/tests/bdd/steps/gestao-de-pirometros.steps.tsx`
- [x] T119 Cenário `Selecionar um pirômetro na lista` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T120 Cenário `Salvar e descartar dependem de haver alteração` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T121 Cenário `Alterações não salvas bloqueiam a troca de pirômetro` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T122 Cenário `Navegar a lista e a paleta pelo teclado` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T123 `make validate` verde

## Fase 8 — Emenda de 2026-11-05: bateria em %, display de 7 segmentos, local futuro (RF-06)

- [x] T124 Teste unitário de `clampPercent` em `app/tests/unit/core/domain/models/percent.model.spec.ts`
- [x] T125 Criar `app/core/domain/models/percent.model.ts`
- [x] T126 Teste unitário de `SevenSegmentDisplay` (segmentos acesos por dígito, traços, células, texto acessível) em `app/tests/unit/adapters/presenters/components/SevenSegmentDisplay.spec.tsx`
- [x] T127 Criar `app/adapters/presenters/components/SevenSegmentDisplay.tsx`
- [x] T128 Teste unitário de `BatteryIndicator` (`63%`, barra proporcional, limite 0–100, nulo, sem cor de aviso) em `app/tests/unit/adapters/presenters/components/BatteryIndicator.spec.tsx`
- [x] T129 Criar `app/adapters/presenters/components/BatteryIndicator.tsx` (depende de T125, T128)
- [x] T130 Teste unitário de `PyrometerCard` (display, bateria em %, traços sem leitura, sem código do local) em `app/tests/unit/adapters/presenters/components/PyrometerCard.spec.tsx`
- [x] T131 Alterar `app/adapters/presenters/components/PyrometerCard.tsx` (depende de T127, T129, T130)
- [x] T132 Alterar o passo do card (`bateria 62%`) e criar os passos novos em `app/tests/bdd/steps/gestao-de-pirometros.steps.tsx`
- [x] T133 Cenário `Bateria em porcentagem com barra proporcional` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T134 Cenário `Bateria fora de 0 a 100 limita a barra` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T135 Cenário `Temperatura em display de 7 segmentos` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T136 Cenário `Sem leitura mostra traços no display` em `app/tests/bdd/gestao-de-pirometros.feature`
- [x] T137 `make validate` verde

## Fase 9 — Ajuste da emenda do display: maior e vermelho (RF-06)

- [x] T138 Teste unitário do display (altura `h-8`, dígitos `text-red-500`, apagados tênues, sem `dark:`) em `app/tests/unit/adapters/presenters/components/SevenSegmentDisplay.spec.tsx` e do card (cor fixa, independente do pirômetro e do valor) em `app/tests/unit/adapters/presenters/components/PyrometerCard.spec.tsx`
- [x] T139 Alterar `app/adapters/presenters/components/SevenSegmentDisplay.tsx` (tamanho e cor)
- [x] T140 Alterar o cenário `Temperatura em display de 7 segmentos` e o passo da cor em `app/tests/bdd/gestao-de-pirometros.feature` e `app/tests/bdd/steps/gestao-de-pirometros.steps.tsx`
- [x] T141 `make validate` verde

## Fase 10 — Emenda de 2026-11-05: gráfico sem quebra e com ponto por leitura (RF-10)

- [x] T142 Teste unitário do mapeamento sem lacuna (leituras a 2 h continuam ligadas, sem `null`) em `app/tests/unit/core/domain/models/series-points.model.spec.ts` (substitui `series-gap.model.spec.ts`)
- [x] T143 Renomear para `app/core/domain/models/series-points.model.ts` (só mapeia pontos), remover `SERIES_GAP_SECONDS` de `app/core/domain/constants/readings.constants.ts` e atualizar as importações em `app/adapters/presenters/components/Sparkline.tsx` e `TemperatureChart.tsx`
- [x] T144 Teste unitário do gráfico (um ponto por leitura, uma só linha reta entre leituras espaçadas, ponto ativo maior) em `app/tests/unit/adapters/presenters/components/TemperatureChart.spec.tsx`
- [x] T145 Alterar `app/adapters/presenters/components/TemperatureChart.tsx` (`type="linear"`, `dot`, `activeDot`)
- [x] T146 Cenário `Leituras espaçadas aparecem ligadas por linha com um ponto cada` e passos em `app/tests/bdd/gestao-de-pirometros.feature` e `app/tests/bdd/steps/gestao-de-pirometros.steps.tsx` (remove os passos de lacuna)
- [x] T147 `make validate` verde

## Fase 11 — Emenda de 2026-11-05: remoção da miniatura dos cards (RF-06)

- [x] T148 Testes unitários sem miniatura e sem a consulta extra em `app/tests/unit/adapters/presenters/components/PyrometerCard.spec.tsx`, `app/tests/unit/adapters/presenters/components/PyrometerCards.spec.tsx` e `app/tests/unit/adapters/presenters/pages/MonitoringPage.spec.tsx`; remover `app/tests/unit/adapters/presenters/components/Sparkline.spec.tsx`
- [x] T149 Remover `app/adapters/presenters/components/Sparkline.tsx`; alterar `app/adapters/presenters/components/PyrometerCard.tsx`, `app/adapters/presenters/components/PyrometerCards.tsx` e `app/adapters/presenters/pages/MonitoringPage.tsx` (sem `lastHour`); remover `sparklineLabel` de `app/core/domain/constants/text-keys.constants.ts` e `app/infra/tools/i18n.tool.ts`
- [x] T150 Alterar o cenário `Card por pirômetro ativo` (sem miniatura) em `app/tests/bdd/gestao-de-pirometros.feature` e os passos/`FakeApi` em `app/tests/bdd/steps/gestao-de-pirometros.steps.tsx`, `app/tests/bdd/steps/graficos.steps.tsx` e `app/tests/bdd/support/fake-api.ts`
- [x] T151 `make validate` verde

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T022, T058, T059, T066, T071 |
| RF-02 | T106, T107, T112, T113, T001, T006, T030, T031, T060, T061, T072 |
| RF-03 | T114, T115, T120, T008, T026, T027, T030, T031, T036, T037, T040, T041, T042, T043, T073, T076 |
| RF-04 | T088, T089, T101, T009, T010, T046, T047, T052, T053, T054, T055, T056, T057, T074, T075 |
| RF-05 | T002, T003, T041, T047, T053, T061, T081, T085 |
| RF-06 | T148, T149, T150, T124, T125, T126, T127, T128, T129, T130, T131, T133, T134, T135, T136, T019, T020, T024, T025, T034, T035, T044, T045, T046, T047, T048, T049, T079 |
| RF-07 | T046, T047, T080 |
| RF-08 | T009, T010, T047, T048, T049, T062, T063, T082 |
| RF-09 | T004, T005, T011, T012, T028, T029, T038, T039, T050, T051, T083 |
| RF-10 | T142, T143, T144, T145, T146, T013, T014, T015, T016, T017, T018, T052, T053, T084 |
| RF-11 | T009, T010, T062, T063, T064, T065, T077 |
| RF-12 | T060, T061, T062, T063, T086 |
| RF-13 | T021, T022, T013, T014 |
| RF-15 | T090, T091, T092, T093, T094, T095, T096, T097, T102, T103 |
| RF-16 | T098, T099, T104 |
| RF-17 | T112, T113, T116, T117, T119, T122 |
| RF-18 | T108, T109, T110, T111, T122 |
| RF-19 | T114, T115, T121 |
| RF-14 | T036, T037, T074 |
| RNF-01 | T052, T053 |
| RNF-02 | T013, T014 |
| RNF-03 | T048, T049 |
| RNF-04 | T046, T047, T052, T053, T085 |
| RNF-05 | T087 |
| RNF-07 | T116, T117 |
| RNF-08 | T110, T111, T112, T113, T122 |
| RNF-06 | T087 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-11-05

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | `app/adapters/presenters/components/SidebarNav.tsx:20` (item Pirômetros), `app/core/domain/constants/routes.constants.ts` (`/pirometros`), `app/infra/web/app-routes.tsx`; BDD "Menu com Pirômetros" |
| RF-02 | realizado | `app/adapters/presenters/pages/PyrometersPage.tsx:3` lista todos (ativos e inativos) com `PyrometerProfileForm`; BDD "Listar pirômetros" |
| RF-03 | realizado | `app/adapters/presenters/components/PyrometerProfileForm.tsx:43` (`save.mutate`; confirmação, erro e valor preservado); `PyrometersClient.saveProfile`; BDD "Editar…", "Erro ao salvar…", "Não há como criar pirômetro" |
| RF-04 | realizado | `app/core/domain/models/pyrometer-name.model.ts:10` (`displayName`) usado em card, gráfico, filtros e tabela; BDD "Novo apelido aparece em todo lugar", "Nome sem apelido" |
| RF-05 | realizado | paleta de 12 cores em `pyrometer-profile.constants.ts` (igual à da API, coberta por teste), `ColorPicker.tsx:15`, bolinha no card, linha na cor no `TemperatureChart.tsx`; BDD "Cor do pirômetro", "Escolher cor da paleta" |
| RF-06 | realizado | `PyrometerCards.tsx`/`PyrometerCard.tsx:72` (nome, cor, temperatura, data, bateria, tempo sem leitura) e `Sparkline.tsx` (última hora); BDD "Card por pirômetro ativo" |
| RF-07 | realizado | `PyrometerCard.tsx` sem variação por tempo/bateria (testes `deve manter a mesma aparencia…`); BDD "Tempo sem leitura é só informação" |
| RF-08 | realizado | `MonitoringPage.tsx:68` (card ↔ filtro sincronizados), `PyrometerCards.tsx` (ordem alfabética); BDD "Clicar no card filtra o gráfico" |
| RF-09 | realizado | `ChartPeriodSelect.tsx:17`, `chart-period.model.ts`, `GetReadingsSeriesUseCase(período)`; BDD "Escolher período do gráfico" |
| RF-10 | realizado | `series-gap.model.ts:20` (> 900 s), `TemperatureChart.tsx`; testes unitários provam o corte no `path` (2 `M` com lacuna, 1 sem); BDD "Lacuna aparece no gráfico" (por dados, o jsdom não desenha o traço) |
| RF-11 | realizado | `onlyActive` em `PyrometerCards.tsx`/`MonitoringPage.tsx`; `ReadingsPage.tsx` mantém inativos no filtro; BDD "Inativar pirômetro" |
| RF-12 | realizado | estado único de carregando/vazio/erro no `MonitoringPage.tsx` e `PyrometersPage.tsx`; BDD "API indisponível" |
| RF-13 | realizado | textos por chave em `text-keys.constants.ts`/`i18n.tool.ts`; `formatRegDate`; teste "toda chave tem texto" |
| RF-14 | realizado | `useSavePyrometer.ts:16` invalida a lista; BDD "Novo apelido aparece em todo lugar" |
| RNF-01 | realizado | teste "10 pirômetros × 1.000 pontos em < 2 s" em `TemperatureChart.spec.tsx` (≈ 0,2 s no jsdom) |
| RNF-02 | realizado | `reg-date.model.ts:65` (`toEpochSeconds`) é aritmética pura, sem `Date`; testes com 29/02/2028 e virada de ano |
| RNF-03 | realizado | grade fluida `grid-cols-[repeat(auto-fill,minmax(13rem,1fr))]` em `PyrometerCards.tsx` e teste com 10 cards; confirmar na tela em 1366 px |
| RNF-04 | realizado | nome escrito no card, na legenda e no formulário (testes e BDD "Cor do pirômetro") |
| RNF-05 | realizado | `grep` do `dist/` após `make build`: 0 ocorrências de endereço da API |
| RNF-06 | realizado | cobertura total 99,44% (mínimo 90%); nenhum arquivo com código abaixo de 90% (só DTOs, que são tipos) |

**`make validate` (saída real):** `fmt` e `lint` (eslint + tsc) sem erros nem avisos; 49 arquivos e **329 testes unitários** passaram; cobertura "aprovada: 99.44% (mínimo 90.00%)"; **11 testes de integração** (WireMock) passaram; BDD **48 cenários e 275 passos** passaram (32 antigos + 16 novos). `make build` também passou.

**Cenários BDD:** os 16 critérios da spec têm cenário em `app/tests/bdd/gestao-de-pirometros.feature` e todos passam.

**Excesso de escopo:** nenhum. Não há criar/excluir pirômetro, alerta, destaque de comunicação, bateria baixa, exportação nem login.

**Desvios e avisos registrados:**
1. `/bu:checklist` foi pulado a pedido do usuário ("sem enrolação"); `/bu:analyze` apontou só um erro de rastreabilidade, já corrigido.
2. Spec: o cenário "Escolher período do gráfico" ganhou o passo `E que filtrei o pirômetro "PI-12"` para poder provar "o pirômetro filtrado continua o mesmo".
3. Testes antigos ajustados porque o comportamento mudou por exigência da spec, sem afrouxar asserções: `useReadingsSeries`/`MonitoringPage` (o caso de uso agora recebe o período), `PyrometerFilter`/`ReadingsPage`/`usePyrometers` (DTO com apelido, cor, observação, ativo), `SidebarNav`/`AppLayout`/`i18n` (4 itens de menu), rótulo do gráfico ("Gráfico de temperaturas", antes "…do dia"), e no BDD 001 o menu com 4 itens e os passos que olhavam toda chamada de série (a miniatura pede a última hora).
4. Salvar o formulário envia a cor que está selecionada, o que "congela" a cor padrão do pirômetro como cor escolhida.
5. O tempo sem leitura vem pronto da API e só muda a cada atualização (5 min).
6. Pirômetro ativo sem leitura com temperatura aparece como card "Sem leituras com temperatura".
7. O BDD da lacuna confere os dados e a regra (o jsdom não desenha o traço); o desenho do corte é provado nos testes unitários do gráfico.

Veredito: convergido
Tarefas acrescentadas: nenhuma

### Rodada 2 — 2026-11-05 (emendas: RF-04 substituído, RF-15, RF-16)

| Requisito | Estado | Evidência |
|---|---|---|
| RF-04 (emendado) | realizado | `app/core/domain/models/pyrometer-name.model.ts` (`displayName` = `TAG - APELIDO`; sem apelido, só a TAG; sem nome do aparelho, o serial). Todo uso já passa por `displayName`/`resolveName`: cards, legenda/tooltip do gráfico, filtros do Acompanhamento e das Leituras, tabela das Leituras e tela Pirômetros; testes do modelo e de cada componente; BDD "Novo apelido aparece em todo lugar" (`PI-12 - Forno 2`) |
| RF-08 | realizado | a ordem alfabética dos cards segue `displayName`; teste `ordena … "PI-12 - Forno 2", "PI-13", "PI-14"` |
| RF-15 | realizado | `app/core/domain/models/pyrometer-color.model.ts` (`colorsInUse`, cor efetiva dos outros, sem o próprio, sem diferenciar caixa), `ColorPicker.tsx` (cor desabilitada, `aria-label` e `title` "Vermelho (em uso por PI-13)"), `PyrometersPage.tsx`; 409 em `fetch-json.ts` → `ProfileRejectedError(409)` → mensagem "Essa cor já está em uso por outro pirômetro. Escolha outra cor." com o digitado preservado em `PyrometerProfileForm.tsx`; testes unitários, IT (WireMock 409) e BDD "Cor em uso por outro pirômetro fica indisponível" e "API recusa cor já em uso" |
| RF-16 | realizado | `PyrometerCards.tsx` (`grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) e `PyrometerCard.tsx` compacto; teste com 10 cards; BDD "Cards lado a lado" (o jsdom não mede layout: o BDD confere a grade e a ausência de `overflow-x`; confirmar na tela em 1366 px) |
| RNF-03 | realizado | grade fluida sem `overflow-x`; ver RF-16 |

**`make validate` (saída real):** `fmt` e `lint` (eslint + tsc) sem erros nem avisos; 50 arquivos e **347 testes unitários** passaram; cobertura "aprovada: 99.45% (mínimo 90.00%)"; **12 testes de integração** (WireMock) passaram; BDD **51 cenários e 293 passos** passaram (eram 48/275; os 3 novos são os das emendas).

**Excesso de escopo:** nenhum.

**Desvios e avisos:**
1. `make api-types` foi rodado depois do 409 da API, mas o schema gerado continua sem documentar o 409 (só 200 e 422); o tratamento é pelo status, como previsto, e não depende do schema.
2. Em `FakeApi`, a recusa 409 também é simulável à força (`rejectColorInUse`), porque a tela já desabilita a cor em uso e o cenário "API recusa cor já em uso" representa a corrida entre dois usuários.
3. O aviso "salvar congela a cor padrão como escolhida" foi mantido (aceitável, pois a cor agora é única).
4. A cor atual do próprio pirômetro continua selecionável; se a cor que a API devolve para ele coincidir com a de outro (dado inconsistente), ela aparece selecionada e desabilitada.

Veredito: convergido
Tarefas acrescentadas: nenhuma

### Rodada 3 — 2026-11-05 (emenda: redesenho da tela Pirômetros, RF-02, RF-03, RF-17 a RF-19, RNF-07 e RNF-08)

| Requisito | Estado | Evidência |
|---|---|---|
| RF-02 (emendado) | realizado | `app/adapters/presenters/components/PyrometerList.tsx`: uma linha por pirômetro, em ordem pelo nome mostrado (`PyrometersPage.tsx`), bolinha com o nome ao lado, TAG em peso normal e apelido em `<strong>`, serial pequeno, observação com `truncate` e `title`, selo Ativo/Inativo e linha atenuada (`opacity-60`); BDD "Listar pirômetros" |
| RF-03 (emendado) | realizado | `PyrometerEditPanel.tsx`: apelido `n/40`, observação `n/500` (3 linhas), `Switch` "Ativo", Salvar desabilitado sem alteração ou com campo inválido, Descartar só com alteração, "Salvo." junto dos botões, erro 422/409/rede em alerta no painel e valor preservado; BDD "Editar…", "Erro ao salvar…", "Salvar e descartar dependem de haver alteração" |
| RF-17 | realizado | `PyrometersPage.tsx`: `lg:grid-cols-[minmax(0,1fr)_24rem]`, painel `lg:sticky`, sem `max-w` estreito (teste prova); o primeiro da lista vem selecionado; `aria-selected` e `aria-current`, fundo e barra lateral na cor do pirômetro; teclado na lista (setas, Home, End, Enter); cabeçalho com título e uma linha; BDD "Selecionar um pirômetro na lista", "Navegar a lista e a paleta pelo teclado" |
| RF-18 | realizado | `ColorPicker.tsx` (grade `grid-cols-6`, anel e sinal de escolhido, risco `data-strike` e opacidade nas em uso, `title`/`aria-label` "em uso por X", nome e código em texto, setas escolhem a próxima livre com Tab entrando e saindo do grupo) e `Switch.tsx` (`input` nativo `role="switch"`); BDD "Escolher cor da paleta", "Cor em uso por outro pirômetro fica indisponível" |
| RF-19 | realizado | `PyrometersPage.tsx` (`pendingId`, `onDirtyChange`): com alteração a troca fica bloqueada, o painel mostra "Há alterações não salvas" e a troca acontece sozinha ao salvar ou descartar; BDD "Alterações não salvas bloqueiam a troca de pirômetro" |
| RNF-07 | realizado (por construção; confirmar na tela) | lista com `overflow-y-auto` e `lg:max-h-[calc(100vh-11rem)]`, painel de 24 rem em duas colunas e linhas de ~44–52 px (10 linhas ≈ 500 px); o jsdom não mede layout |
| RNF-08 | realizado | testes de teclado de `PyrometerList` e `ColorPicker`, `Switch` nativo, botões nativos com foco visível; BDD "Navegar a lista e a paleta pelo teclado" |

Comportamentos aprovados mantidos: só editar existentes (sem criar/excluir), confirmação ao salvar, mensagens 422/409 com o digitado preservado, cor em uso por outro desabilitada com "em uso por X", nome "TAG - APELIDO", inativos na tela, paleta de 12 cores igual à da API, apelido 40 e observação 500, textos por chave em português.

**`make validate` (saída real):** `fmt` e `lint` (eslint + tsc) sem erros nem avisos; 52 arquivos e **402 testes unitários** passaram (eram 347); cobertura "aprovada: 99.30% (mínimo 90.00%)"; **12 testes de integração** passaram; BDD **55 cenários e 330 passos** passaram (eram 51/293; 4 novos cenários).

**Excesso de escopo:** nenhum (sem dependência nova; sem mudança na API; `PyrometerProfileForm` e seu spec foram substituídos pelo painel).

**Desvios e avisos:**
1. O aviso de alterações não salvas é só texto (sem botões próprios): os botões Salvar e Descartar alterações do rodapé do painel resolvem, e a troca pedida acontece sozinha depois.
2. RNF-07 não é medido em teste (o jsdom não mede layout); por isso o "cabe em 1366×768" deve ser conferido na tela com 10 pirômetros.
3. Se o salvamento falhar com a troca pedida, o painel fica no pirômetro atual com o erro e a alteração; a troca continua pendente até salvar ou descartar.
4. O sinal de escolhido é um check branco; em cores claras (como a lima) o anel escuro ao redor garante a leitura.
5. O BDD antigo "Listar pirômetros" mudou de forma: agora confere a lista e o painel do primeiro, e "Inativar pirômetro" seleciona a linha antes de editar.

Veredito: convergido
Tarefas acrescentadas: nenhuma

### Rodada 4 — 2026-11-05 (emenda: bateria em %, display de 7 segmentos, código do local como futuro — RF-06)

| Requisito | Estado | Evidência |
|---|---|---|
| RF-06 — bateria | realizado | `app/adapters/presenters/components/BatteryIndicator.tsx`: texto `Bateria 63%` e barra fina neutra (`h-1`, `bg-primary`) com largura `clampPercent(valor)%` (`app/core/domain/models/percent.model.ts`); o texto mostra o valor real (130 → "130%", barra 100%); nulo → "Bateria —" sem barra; BDD "Bateria em porcentagem com barra proporcional", "Bateria fora de 0 a 100 limita a barra". **Premissa registrada na spec: unidade presumida %, a confirmar.** |
| RF-06 — temperatura | realizado | `SevenSegmentDisplay.tsx`: SVG próprio, 7 polígonos por célula (`data-segment`, `data-lit`), mínimo de 4 células à direita, painel escuro `bg-neutral-900` com dígitos `text-amber-400` (igual nos dois temas), apagados com `opacity-15`; SVG `aria-hidden` e valor real em `sr-only` ("1510 °C"); sem leitura, `---` no mesmo display com "Sem leituras com temperatura"; BDD "Temperatura em display de 7 segmentos", "Sem leitura mostra traços no display" |
| RF-06 — código do local | realizado (não implementado, como pedido) | o card não mostra `reg_place` (teste `deve nao mostrar o codigo do local`); a spec registra em Fora de escopo a **feature futura** de cadastrar/editar "locais" e atribuir o significado do código a cada pirômetro; sem endpoint, tabela ou tela |
| RF-07 | realizado | a barra e o display não mudam de aparência por bateria ou tempo; testes "mesma cor neutra e nenhum alerta" e BDD "a barra não muda de cor nem aparece alerta" |

**`make validate` (saída real):** `fmt` e `lint` (eslint + tsc) sem erros nem avisos; 55 arquivos e **446 testes unitários** passaram (eram 402); cobertura "aprovada: 99.33% (mínimo 90.00%)"; **12 testes de integração** passaram; BDD **59 cenários e 353 passos** passaram (eram 55/330; 4 novos).

**Excesso de escopo:** nenhum (sem dependência nem fonte nova; sem mudança na API).

**O que o jsdom não verifica (conferir na tela):**
1. O desenho real do display (proporção dos segmentos, tamanho `h-6`, brilho âmbar sobre o painel escuro) e a legibilidade nos temas claro e escuro: os testes provam quais segmentos estão acesos, não a aparência.
2. A largura do display e do card em 2, 3 e 4 colunas (o SVG usa `h-6 w-auto`; o jsdom não calcula layout de SVG).
3. A espessura e o contraste da barra de bateria (`h-1`, `bg-primary` sobre `bg-muted`) em tema escuro; a largura em porcentagem é verificada, a aparência não.
4. A premissa de que `reg_battery` é porcentagem: se for outra unidade (ex.: volts), o texto "%" e a barra ficam errados.

Veredito: convergido
Tarefas acrescentadas: nenhuma

### Rodada 5 — 2026-11-05 (ajuste da emenda do display: maior e vermelho — RF-06)

| Requisito | Estado | Evidência |
|---|---|---|
| RF-06 — tamanho | realizado | `app/adapters/presenters/components/SevenSegmentDisplay.tsx`: o SVG passou de `h-6` para `h-8` (≈ 33% maior, dentro de 25–40%); a grade de 2/3/4 colunas e os 10 cards continuam como estavam (nenhuma largura fixa nova; o display tem `self-start` e o card `overflow-hidden`); teste `deve ser cerca de 33% maior…` |
| RF-06 — cor LED | realizado | painel `bg-neutral-900` com dígitos `text-red-500` (≈ 4,7:1 de contraste sobre o painel, igual nos temas claro e escuro, sem `dark:`); segmentos apagados no mesmo vermelho com `opacity-15`; cor fixa, sem `style` inline: não vem da cor do pirômetro nem da temperatura; testes do display e do card (mesma classe com pirômetro e valor diferentes); BDD "Temperatura em display de 7 segmentos" ganhou "os dígitos acesos são vermelhos, em cor fixa de LED" e "a cor não depende da cor do pirômetro nem da temperatura" |
| RF-06 — acessibilidade | realizado | o SVG segue `aria-hidden` e o valor real continua em `sr-only` ("1510 °C"); testes mantidos |
| RF-07 | realizado | o vermelho é cor fixa de LED, não varia com temperatura, bateria ou tempo; teste "mesma cor do painel quando o texto muda" |

**`make validate` (saída real):** `fmt` e `lint` (eslint + tsc) sem erros nem avisos; 55 arquivos e **450 testes unitários** passaram (eram 446); cobertura "aprovada: 99.33% (mínimo 90.00%)"; **12 testes de integração** passaram; BDD **59 cenários e 355 passos** passaram (eram 353).

**Excesso de escopo:** nenhum.

**O que o jsdom não verifica (conferir na tela):** se o display 33% maior cabe bem nos cards de 4 colunas a 1280 px e nos de 2 colunas em telas estreitas (largura do display + unidade `°C` dentro do card); o contraste real do vermelho sobre o painel escuro e o brilho dos segmentos apagados (`opacity-15`) em monitores diferentes; e a legibilidade geral nos dois temas.

Veredito: convergido
Tarefas acrescentadas: nenhuma

### Rodada 6 — 2026-11-05 (emenda: gráfico sem quebra e com ponto por leitura — RF-10 substituída)

| Requisito | Estado | Evidência |
|---|---|---|
| RF-10 (emendada) | realizado | `app/core/domain/models/series-points.model.ts` (renomeado de `series-gap.model.ts`): `toChartPoints` só mapeia as leituras, sem inserir ponto vazio; `gapSeconds` e `SERIES_GAP_SECONDS` removidos (nenhum uso restante); `TemperatureChart.tsx`: `type="linear"`, `dot={{ r: 3 }}` e `activeDot={{ r: 5 }}` na cor da linha, `isAnimationActive={false}` e dados memoizados mantidos; testes unitários: leituras a 2 h/3 dias continuam ligadas e com um ponto cada, o `path` tem um só `M` e `L` (sem `C`), um `circle.recharts-line-dot` de `r=3` por leitura com `fill`/`stroke` na cor do pirômetro; BDD "Leituras espaçadas aparecem ligadas por linha com um ponto cada" |

**`make validate` (saída real):** `fmt` e `lint` (eslint + tsc) sem erros nem avisos; 55 arquivos e **454 testes unitários** passaram (eram 450); cobertura "aprovada: 99.32% (mínimo 90.00%)"; **12 testes de integração** passaram; BDD **59 cenários e 355 passos** passaram (o cenário de lacuna foi substituído pelo novo; os passos de lacuna foram removidos).

**Excesso de escopo:** nenhum (sem mudança em API, banco, cards ou tela de gestão; a miniatura do card só passou a usar o mesmo mapeamento sem quebra, e continua sem pontos).

**Desvios e avisos:**
1. Esta rodada **não** fez commit nem push (o coordenador pediu "sem commit"; o plano citava push na `main`, que implantaria).
2. O BDD confere o mapeamento (as duas leituras recebidas, sem ponto vazio entre elas). Tentei exigir os dois pontos no DOM e falhou: no gráfico responsivo do BDD o jsdom não desenha traço nem pontos. Por isso a checagem de DOM saiu do BDD e o desenho (`path`, pontos, cor, raio) fica provado no teste unitário de tamanho fixo.
3. A miniatura do card, com uma só leitura na última hora, mostra o ponto padrão do Recharts (um círculo branco com contorno); isso já existia e não faz parte desta emenda.

**O que o jsdom não verifica (conferir em http://localhost:5173, Acompanhamento):** se o ponto de 3 px é visível e proporcional com muitas leituras (3 dias, ~8 mil pontos por pirômetro), ou se polui o gráfico; o ponto maior (`r=5`) e o tooltip ao passar o mouse; e o aspecto da linha reta (`linear`) entre leituras muito espaçadas.

Veredito: convergido
Tarefas acrescentadas: nenhuma

### Rodada 7 — 2026-11-05 (emenda: remoção da miniatura dos cards — RF-06)

| Requisito | Estado | Evidência |
|---|---|---|
| RF-06 (sem miniatura) | realizado | `app/adapters/presenters/components/Sparkline.tsx` e o spec removidos; `PyrometerCard.tsx` e `PyrometerCards.tsx` sem as props `points`/`series`; o card tem só nome (TAG - APELIDO), cor, display de 7 segmentos, data, bateria % e tempo sem leitura (teste `deve manter so nome, display, data, bateria e tempo sem leitura`, com um único `svg`, o do display); espaçamento `gap-1.5` e sem o bloco de 36 px da miniatura |
| Consulta extra | removida | `MonitoringPage.tsx` não chama mais `useReadingsSeries(null, 'hour')` (era só para a miniatura) nem a inclui no erro/refazer; teste `deve fazer so a consulta do grafico quando abre` (uma chamada, `(null, 'today')`); o período "Última hora" do seletor do gráfico e `GetReadingsSeriesUseCase` continuam |
| Textos e constantes | removidos | chave `sparklineLabel` fora de `text-keys.constants.ts` e `i18n.tool.ts`; nenhuma referência restante a `Sparkline`/`sparkline` no código (busca feita) |
| BDD | atualizado | "Card por pirômetro ativo" passou de "E uma miniatura…" para "Mas o card não tem miniatura de temperaturas"; `FakeApi` e os passos deixaram de separar a janela da miniatura |

**`make validate` (saída real):** `fmt` e `lint` (eslint + tsc) sem erros nem avisos; 54 arquivos e **453 testes unitários** passaram; cobertura "aprovada: 99.31% (mínimo 90.00%)"; **12 testes de integração** passaram; BDD **59 cenários e 355 passos** passaram.

**Excesso de escopo:** nenhum. Sem mudança em API, banco ou gráfico principal.

**O que o jsdom não verifica (conferir em http://localhost:5173, Acompanhamento):** se o card ficou sem espaço vazio embaixo e com altura boa nas 2, 3 e 4 colunas (cards de alturas diferentes na mesma linha, como um sem leitura, esticam até a altura do vizinho por causa do `h-full`); e se a grade com os cards mais baixos continua equilibrada com 10 pirômetros em 1366 px.

Veredito: convergido
Tarefas acrescentadas: nenhuma
