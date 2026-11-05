# Plano de implementação — Gestão de pirômetros, cards de visão geral e gráfico melhorado

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.
> Depende da API (spec 002 da `pirometros-api`, convergida): `GET /api/pyrometers` estendido,
> `GET /api/pyrometers/summary` e `PUT /api/pyrometers/{id}`. Os tipos vêm de `make api-types`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Tipos da API | Regenerar `api-schema.d.ts` com `make api-types` apontando para a API no ar | Editar o arquivo à mão (proibido, P5) | Constituição P5/P6; o contrato nasce do OpenAPI |
| Nome mostrado | Função pura `displayName` (apelido → nome do aparelho → serial) usada por cards, gráfico, filtros e tabela | Montar o nome em cada componente | RF-04: uma regra, um lugar (DRY) |
| Cor e nome no gráfico/tabela | O componente recebe a lista de pirômetros e procura por serial; sem correspondência, cai na paleta por posição | Pedir cor/nome pela série da API | A série da API só traz serial e nome do aparelho; apelido e cor moram no complemento (RF-04, RF-05) |
| Paleta | 12 cores em constante de domínio, **idênticas e na mesma ordem** da API; o seletor mostra só essas | Seletor livre de cor (fora de escopo) | Esclarecimento "paleta fixa de 12 cores" |
| Eixo de tempo do gráfico | `x` = segundos corridos por aritmética de calendário puro (dias desde 1970 × 86.400 + segundos do dia), sem `Date` | `Date.UTC`/`new Date(reg_date)` | P2: nunca aplicar `Date` a `reg_date`. O eixo "segundos do dia" atual não serve para 24 h e 3 dias |
| Ticks do eixo | Passo conforme a duração do período (15 min, 1 h, 3 h, 12 h), alinhados à meia-noite; rótulo `HH:mm`, ou `dd/MM HH:mm` quando o período cruza a meia-noite | Deixar o Recharts escolher | Rótulos legíveis nos cinco períodos |
| Lacuna (**substituída pela emenda abaixo**) | Antes: ponto `null` após 900 s. Agora não há lacuna | — | 
| Períodos do gráfico | Chave (`hour`, `sixHours`, `day`, `today`, `threeDays`) → janela calculada pelo relógio local no momento da consulta; `today` mantém 00:00–23:59 | Guardar janela no estado | A janela relativa precisa andar a cada atualização de 5 min; a chave da consulta é a chave do período |
| Atualização automática | Mantém 5 min (`REFRESH_INTERVAL_MS`) em cards, gráfico e miniaturas | 30 s | Esclarecimento: o sincronizador só traz dado a cada 5 min |
| Miniatura dos cards | **Removida (emenda 2026-11-05)**, junto da consulta extra de série da última hora | Pedido do usuário |
| Estados de carregando/erro | **Um** estado por tela: o Acompanhamento junta pirômetros, resumo e série; um só "Carregando" e um só "Tentar de novo" (refaz as três consultas) | Um alerta por bloco | Os cenários BDD existentes usam `getByRole` no singular; também evita a tela cheia de alertas |
| Gravação do complemento | Mutação por formulário (uma por pirômetro); ao sucesso, invalida a lista de pirômetros | Estado global de edição | RF-03/RF-14: cada linha tem seu estado de salvando/salvo/erro e preserva o digitado |
| Erro de gravação | `PUT` 404/422 vira `ProfileRejectedError`; falha de rede ou 5xx vira `ReadingsUnavailableError`; mensagens em português por chave de texto | Mostrar o texto do servidor (inglês) | P1: toda mensagem em português |
| Cor ao salvar | O formulário envia a cor escolhida; a cor padrão que a API devolve já aparece selecionada | Enviar `null` quando não mexeu | KISS; salvar "congela" a cor padrão do pirômetro (registrado como aviso) |
| Cards sem leitura | Pirômetro ativo sem resumo mostra o card com "Sem leituras com temperatura" | Esconder o card | RF-06: todo pirômetro ativo tem card |
| Tempo sem leitura | `minutes_without_reading` da API: `N min`, `H h` ou `H h MM min` (a partir de 60), seguido de "sem leitura" | Calcular no front | O "agora" é do servidor (a API já calcula) |
| Rota nova | `/pirometros` | `/pyrometers` | Rotas existentes são em português (`/leituras`, `/saude`) |

## Emendas de 2026-11-05 (RF-04 substituído, RF-15, RF-16)

| Decisão | Escolha | Por quê |
|---|---|---|
| Nome mostrado | `displayName` devolve `TAG - APELIDO` (TAG = nome do aparelho, ou o serial); sem apelido, só a TAG. Todo uso já passa por `displayName`/`resolveName`, então a regra muda num lugar só | RF-04 emendado; a ordem alfabética dos cards (RF-08) passa a usar esse texto sem outra mudança |
| Cores em uso | Função pura `colorsInUse(pyrometers, ownerId)` (cor efetiva em minúsculas → nome mostrado do dono), sem contar o próprio pirômetro; o `ColorPicker` recebe esse mapa e desabilita a cor, com texto "em uso por …" | RF-15; a cor efetiva (inclusive a padrão) já vem de `GET /api/pyrometers` |
| 409 | `putJson` passa a tratar 404, 409 e 422 como `ProfileRejectedError(status)`; o formulário escolhe a mensagem pelo status (409 → "cor já em uso") | O schema gerado ainda não declara o 409: trata-se só pelo status, sem regenerar tipos |
| Grade dos cards | `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, cartão mais compacto (menos espaço interno e texto menor) | RF-16 e RNF-03 |

**Arquivos alterados pelas emendas:** `core/domain/models/pyrometer-name.model.ts` (+spec), `core/domain/models/pyrometer-color.model.ts` (novo, +spec), `adapters/clients/fetch-json.ts` (+`pyrometers.client.spec.ts`), `adapters/presenters/components/ColorPicker.tsx`, `PyrometerProfileForm.tsx`, `PyrometerCards.tsx`, `PyrometerCard.tsx` (+specs), `adapters/presenters/pages/PyrometersPage.tsx` (+spec), `text-keys.constants.ts`, `i18n.tool.ts`, WireMock (`pyrometer-save.json`) e BDD (`fake-api.ts`, `gestao-de-pirometros.feature` e `.steps.tsx`).

## Emenda de 2026-11-05: redesenho da tela Pirômetros (RF-02, RF-03, RF-17 a RF-19)

| Decisão | Escolha | Por quê |
|---|---|---|
| Estrutura | Master–detail: `PyrometerList` (`listbox` com linhas `option`) + `PyrometerEditPanel` (um `<form>` do selecionado), em `lg:grid-cols-[minmax(0,1fr)_24rem]`, painel `lg:sticky`; abaixo de 1024 px empilha | RF-17; aproveita a largura e cabe em 1366×768 (RNF-07) |
| Seleção | Estado da página (`selectedId`; padrão = primeiro da lista ordenada); o painel é remontado por `key` ao trocar | Cada pirômetro começa com os campos do seu complemento |
| Alterações não salvas | O painel informa à página se há alteração (`onDirtyChange`). Com alteração, clicar em outra linha só marca o pedido (`pendingId`) e o painel mostra o aviso; a troca acontece sozinha quando a alteração some (salvar ou descartar) | RF-19; a opção mais simples e acessível, sem botões extras no aviso (os botões Salvar/Descartar do rodapé já resolvem) |
| Dirty | Campos × "linha de base" (o complemento salvo); ao salvar com sucesso a linha de base passa a ser o enviado | Salvar fica habilitado só com alteração (RF-03) e a confirmação some ao voltar a editar |
| Paleta | `ColorPicker` em grade 6×2 de botões `role="radio"` com roving tabindex; setas escolhem o próximo não desabilitado; selecionada com anel e sinal de escolhido; em uso com risco diagonal e `title`/`aria-label` "… (em uso por X)"; texto com o nome e o código da cor escolhida | RF-18, RNF-08; elementos nativos, sem dependência |
| Interruptor | `Switch` com `<input type="checkbox" role="switch">` nativo e o visual por CSS | Acessível sem biblioteca |
| Lista | `ul role="listbox"`, linha `role="option"` com `aria-selected` e `aria-current`, roving tabindex, setas/Home/End movem a seleção, Enter/clique seleciona; rolagem interna só se passar da altura | RF-17, RNF-07/08 |
| Nome em duas partes | `displayParts` devolve `{ tag, nickname }` para a TAG em peso normal e o apelido em destaque; `displayName` continua `TAG - APELIDO` | RF-02 |

**Arquivos da emenda:** `core/domain/models/pyrometer-name.model.ts` (+spec), `adapters/presenters/components/Switch.tsx`, `PyrometerList.tsx`, `PyrometerEditPanel.tsx` (substitui `PyrometerProfileForm.tsx`, removido com o spec), `ColorPicker.tsx`, `adapters/presenters/pages/PyrometersPage.tsx` (todos com spec), chaves de texto, e o BDD (`gestao-de-pirometros.feature` e `.steps.tsx`).

## Emenda de 2026-11-05: bateria em %, display de 7 segmentos, local futuro (RF-06)

| Decisão | Escolha | Por quê |
|---|---|---|
| Display de temperatura | Componente `SevenSegmentDisplay` com **SVG próprio**: cada caractere (dígitos, `-`, espaço) é um `<g data-char>` com 7 polígonos (`data-segment` a–g, `data-lit`); apagados com opacidade baixa; painel escuro (`bg-neutral-900`) com dígitos **vermelhos de LED** (`text-red-500`, contraste ≈ 4,7:1 sobre o painel) e apagados com `opacity-15` do mesmo vermelho, igual em tema claro e escuro; altura `h-8` (≈ 33% maior que o `h-6` anterior), cor fixa que não vem do pirômetro nem da temperatura; 4 células no mínimo, alinhadas à direita; a unidade `°C` fica ao lado em texto | Sem dependência nem fonte nova; verificável em teste pelos segmentos acesos |
| Texto acessível | O SVG é `aria-hidden`; o valor real (`1510 °C`) fica em texto `sr-only` junto do display | Leitores de tela e testes continuam lendo o valor |
| Sem leitura | `---` no mesmo display, com o texto "Sem leituras com temperatura" mantido | Consistência visual (RF-06) |
| Bateria | `BatteryIndicator`: texto `Bateria 63%` e barra fina (`h-1`) com largura `clamp(valor, 0, 100)%`, cor neutra (sem aviso); nulo mostra "—" sem barra. O texto mostra o valor real; só a barra é limitada | RF-06/RF-07; a unidade % é premissa a confirmar |
| Clamp | Função pura `clampPercent` em `core/domain/models/percent.model.ts` | Regra testável sem React |
| Código do local | **Não implementado.** `reg_place` não aparece no card; futura feature de cadastro/edição de "locais" (fora de escopo, sem endpoint nem tabela) | Pedido do usuário |

**Arquivos da emenda:** `core/domain/models/percent.model.ts` (+spec), `adapters/presenters/components/SevenSegmentDisplay.tsx` (+spec), `BatteryIndicator.tsx` (+spec), `PyrometerCard.tsx` (+spec) e o BDD (`gestao-de-pirometros.feature` e `.steps.tsx`).

## Emenda de 2026-11-05: gráfico sem quebra e com ponto por leitura (RF-10)

| Decisão | Escolha | Por quê |
|---|---|---|
| Ligação | `toChartPoints` só mapeia as leituras para `{ x, temperature }`; nenhum ponto `null` é inserido e `gapSeconds` e `SERIES_GAP_SECONDS` deixam de existir | RF-10 emendada: leituras espaçadas não podem sumir |
| Nome do modelo | `series-gap.model.ts` → `series-points.model.ts` (o modelo não trata mais lacuna) | Só 3 importações (gráfico, miniatura, passo BDD) |
| Traço | ~~`type="linear"`~~ **substituído pela emenda abaixo** (`monotone`) | — |
| Pontos | `dot={{ r: 3 }}` e `activeDot={{ r: 5 }}` na cor da linha; `isAnimationActive={false}` e dados memoizados mantidos | Cada leitura visível; sem re-registro da série |
| Miniatura dos cards | Removida (ver a emenda de 2026-11-05 abaixo) | — |

**Arquivos da emenda:** `core/domain/models/series-points.model.ts` (renomeado, +spec), `core/domain/constants/readings.constants.ts`, `adapters/presenters/components/TemperatureChart.tsx` e `Sparkline.tsx` (importação), BDD (`gestao-de-pirometros.feature` e `.steps.tsx`).

## Emenda de 2026-11-05: remoção da miniatura dos cards (RF-06)

| Decisão | Escolha | Por quê |
|---|---|---|
| Miniatura | `Sparkline.tsx` e o spec saem; `PyrometerCard` e `PyrometerCards` perdem as props `points` e `series` | Pedido do usuário (aparecia em branco) |
| Consulta extra | `useReadingsSeries(null, 'hour')` no `MonitoringPage` existia só para a miniatura: removida, junto do tratamento de erro/refazer dela. O período "Última hora" do gráfico (`ChartPeriodKey`) e `GetReadingsSeriesUseCase` continuam | O gráfico principal usa a mesma consulta com o período escolhido |
| Texto e constantes | Chave `sparklineLabel` sai de `text-keys` e `i18n`; nenhuma constante fica sem uso | Sem código morto |
| Layout do card | Sem o bloco de 36 px da miniatura; o card termina na linha do tempo sem leitura, com espaçamento `gap-1.5` | Sem espaço vazio |
| BDD | `FakeApi` deixa de separar a janela da miniatura (todo `lastSeries` é do gráfico); passos que filtravam por janela simplificados | A miniatura era a única consulta de janela curta |

**Arquivos da emenda:** `adapters/presenters/components/Sparkline.tsx` (removido), `PyrometerCard.tsx`, `PyrometerCards.tsx`, `adapters/presenters/pages/MonitoringPage.tsx`, `core/domain/constants/text-keys.constants.ts`, `infra/tools/i18n.tool.ts`, e os testes e BDD correspondentes.

## Emenda de 2026-11-05: eixos ajustados aos dados (RF-20, RF-09, RF-10)

| Decisão | Escolha | Por quê |
|---|---|---|
| Eixo de temperatura | Função pura `buildValueAxis(valores)` em `core/domain/models/value-axis.model.ts`: sem valores devolve `null` (o gráfico usa o padrão); com valores, `[mín − margem, máx + margem]` com margem `max(5% da amplitude, 20)`, arredondando para baixo/cima a múltiplos de 50 (de 10 quando a faixa total é menor que 200); nunca clampa em 0 | RF-20; legibilidade |
| Eixo de horário | `buildChartAxis(período, extensão?)`: com extensão (primeiro e último `x` exibidos), domínio `[mín − folga, máx + folga]` com folga `max(2% da extensão, 300 s)`; sem extensão, a janela do período como antes. A data aparece nas marcas quando o domínio cruza a meia-noite (calculado pelo dia da época, não pelo texto do período) | O seletor continua definindo quais leituras vêm; o eixo mostra só o que veio |
| Marcas | `STEPS` ganha um degrau de 5 min para extensões até 30 min; os demais (15 min, 1 h, 3 h, 12 h) não mudam | Extensões curtas ainda ganham marcas |
| Ponto | `r=3`; `r=2` quando o total de pontos visíveis passa de 200; `activeDot` segue `r=5`; linha reta e tooltip mantidos | RF-10 |
| Onde calcula | `TemperatureChart` calcula extensão e domínio a partir das séries recebidas (já filtradas por período, pirômetro e ativos) e memoiza | Sem mudar página nem API |

**Arquivos da emenda:** `core/domain/models/value-axis.model.ts` (novo, +spec), `core/domain/models/chart-axis.model.ts` (+spec), `adapters/presenters/components/TemperatureChart.tsx` (+spec), e o BDD (`gestao-de-pirometros.feature` e `.steps.tsx`).

## Emenda de 2026-11-05: linha suavizada, mais grossa e arredondada (RF-10)

| Decisão | Escolha | Por quê |
|---|---|---|
| Tipo da linha | `type="monotone"` (monotoneX do Recharts): curva cúbica monotônica, passa por todas as leituras e **não ultrapassa os valores medidos** entre duas leituras | Substitui o `linear` (que evitava curva inventada); a monotônica não inventa picos nem vales |
| Traço | `strokeWidth={2.5}`, `strokeLinecap="round"`, `strokeLinejoin="round"` | Pedido do usuário ("mais grossa e arredondadinha") |
| Mantidos | Pontos (`r=3`, `r=2` acima de 200), `activeDot` `r=5`, eixos ajustados, tooltip, cor por pirômetro, `isAnimationActive={false}` e dados memoizados | Sem outras mudanças |
| Risco | Rajadas com muitos pontos: traço grosso mais pontos podem virar mancha | Verificado em captura (Todos e PI-15 isolado); o ponto já encolhe a `r=2` acima de 200 pontos |

**Arquivos da emenda:** `adapters/presenters/components/TemperatureChart.tsx` (+spec) e o spec/plan/tasks; o BDD não cita o tipo da linha.

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| Client atrás de interface (já usado) | `IPyrometersClient` ganha `listSummaries` e `saveProfile` | Isolar a rede (P5) e permitir mock | mais dois métodos na interface |
| Adaptador UI↔caso de uso (hooks, já usado) | `usePyrometerSummaries`, `useSavePyrometer` | Componente não conhece client | um hook por caso de uso |
| Funções puras de domínio | `displayName`, período, eixo, lacuna, duração | Regra testável sem React | nenhum |

**Considerados e recusados:** Context/store global para o pirômetro selecionado (estado local da página basta, YAGNI); Strategy para os cinco períodos (uma tabela de chave → janela resolve); biblioteca de datas (a aritmética de calendário necessária cabe em duas funções e a P2 a proíbe sobre `reg_date`); biblioteca de formulário (4 campos).

## Arquivos a criar ou alterar

Todo caminho sob `app/`. Teste unitário espelhado em `app/tests/unit/<mesmo caminho>` com sufixo `.spec.ts(x)`.

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| adapters/clients | `adapters/clients/api-schema.d.ts` | regenerar (`make api-types`) | — (gerado) |
| core/domain | `core/domain/constants/pyrometer-profile.constants.ts` (paleta de 12 cores com chave de nome, limites 40 e 500) | criar | `tests/unit/core/domain/constants/pyrometer-profile.constants.spec.ts` |
| core/domain | `core/domain/constants/chart-periods.constants.ts` (cinco períodos, chave e texto) | criar | `tests/unit/core/domain/constants/chart-periods.constants.spec.ts` |
| core/domain | `core/domain/constants/readings.constants.ts` (`SERIES_GAP_SECONDS`) | alterar | coberto por `series-gap.model.spec.ts` |
| core/domain | `core/domain/constants/routes.constants.ts`, `query-keys.constants.ts`, `text-keys.constants.ts` | alterar | `tests/unit/infra/tools/i18n.tool.spec.ts` (alterar: toda chave tem texto) |
| core/domain | `core/domain/dtos/pyrometer.dto.ts` (apelido, cor, observação, ativo) | alterar | — (dado puro) |
| core/domain | `core/domain/dtos/pyrometer-summary.dto.ts`, `pyrometer-profile.dto.ts` | criar | — (dado puro) |
| core/domain | `core/domain/errors/profile-rejected.error.ts` | criar | `tests/unit/core/domain/errors/profile-rejected.error.spec.ts` |
| core/domain | `core/domain/models/pyrometer-name.model.ts` (`displayName`, ativos, ordem alfabética) | criar | `tests/unit/core/domain/models/pyrometer-name.model.spec.ts` |
| core/domain | `core/domain/models/chart-period.model.ts` (chave → janela) | criar | `tests/unit/core/domain/models/chart-period.model.spec.ts` |
| core/domain | `core/domain/models/chart-axis.model.ts` (domínio, ticks, rótulo) | criar | `tests/unit/core/domain/models/chart-axis.model.spec.ts` |
| core/domain | `core/domain/models/series-gap.model.ts` (pontos com lacuna) | criar | `tests/unit/core/domain/models/series-gap.model.spec.ts` |
| core/domain | `core/domain/models/duration.model.ts` (minutos → horas e minutos) | criar | `tests/unit/core/domain/models/duration.model.spec.ts` |
| core/domain | `core/domain/models/reg-date.model.ts` (`toEpochSeconds`, `formatEpoch`; remove o que ficar sem uso) | alterar | `tests/unit/core/domain/models/reg-date.model.spec.ts` |
| interfaces | `interfaces/adapters/clients/i-pyrometers.client.ts` (`listSummaries`, `saveProfile`) | alterar | — |
| interfaces | `interfaces/core/application/i-list-pyrometer-summaries.use-case.ts`, `i-save-pyrometer-profile.use-case.ts` | criar | — |
| interfaces | `interfaces/core/application/i-get-readings-series.use-case.ts` (recebe a chave do período) | alterar | — |
| core/application | `core/application/list-pyrometer-summaries.use-case.ts` | criar | `tests/unit/core/application/list-pyrometer-summaries.use-case.spec.ts` |
| core/application | `core/application/save-pyrometer-profile.use-case.ts` | criar | `tests/unit/core/application/save-pyrometer-profile.use-case.spec.ts` |
| core/application | `core/application/get-readings-series.use-case.ts` (período padrão `today`) | alterar | `tests/unit/core/application/get-readings-series.use-case.spec.ts` |
| adapters/clients | `adapters/clients/fetch-json.ts` (`sendJson` para `PUT`) | alterar | coberto por `pyrometers.client.spec.ts` |
| adapters/clients | `adapters/clients/pyrometers.client.ts` | alterar | `tests/unit/adapters/clients/pyrometers.client.spec.ts` |
| adapters/presenters | `adapters/presenters/dependencies/AppDependencies.tsx` | alterar | `tests/unit/adapters/presenters/dependencies/AppDependencies.spec.tsx` |
| adapters/presenters | `adapters/presenters/hooks/usePyrometerSummaries.ts` | criar | `tests/unit/adapters/presenters/hooks/usePyrometerSummaries.spec.tsx` |
| adapters/presenters | `adapters/presenters/hooks/useSavePyrometer.ts` | criar | `tests/unit/adapters/presenters/hooks/useSavePyrometer.spec.tsx` |
| adapters/presenters | `adapters/presenters/hooks/useReadingsSeries.ts` (período) | alterar | `tests/unit/adapters/presenters/hooks/useReadingsSeries.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/ColorPicker.tsx` | criar | `tests/unit/adapters/presenters/components/ColorPicker.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/PyrometerProfileForm.tsx` | criar | `tests/unit/adapters/presenters/components/PyrometerProfileForm.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/Sparkline.tsx` | criar | `tests/unit/adapters/presenters/components/Sparkline.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/PyrometerCard.tsx` | criar | `tests/unit/adapters/presenters/components/PyrometerCard.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/PyrometerCards.tsx` | criar | `tests/unit/adapters/presenters/components/PyrometerCards.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/ChartPeriodSelect.tsx` | criar | `tests/unit/adapters/presenters/components/ChartPeriodSelect.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/TemperatureChart.tsx` (período, cor, nome, lacuna) | alterar | `tests/unit/adapters/presenters/components/TemperatureChart.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/PyrometerFilter.tsx` (nome mostrado) | alterar | `tests/unit/adapters/presenters/components/PyrometerFilter.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/ReadingsTable.tsx` (nome mostrado) | alterar | `tests/unit/adapters/presenters/components/ReadingsTable.spec.tsx` |
| adapters/presenters | `adapters/presenters/components/SidebarNav.tsx` (item Pirômetros) | alterar | `tests/unit/adapters/presenters/components/SidebarNav.spec.tsx` |
| adapters/presenters | `adapters/presenters/pages/PyrometersPage.tsx` | criar | `tests/unit/adapters/presenters/pages/PyrometersPage.spec.tsx` |
| adapters/presenters | `adapters/presenters/pages/MonitoringPage.tsx` | alterar | `tests/unit/adapters/presenters/pages/MonitoringPage.spec.tsx` |
| adapters/presenters | `adapters/presenters/pages/ReadingsPage.tsx` (filtro com inativos) | alterar | `tests/unit/adapters/presenters/pages/ReadingsPage.spec.tsx` |
| infra | `infra/tools/i18n.tool.ts` | alterar | `tests/unit/infra/tools/i18n.tool.spec.ts` |
| infra | `infra/web/app-routes.tsx` | alterar | coberto por `tests/unit/infra/web/web-entry.spec.tsx` |
| infra | `infra/init/ioc.init.tsx` | alterar | fora da conta (constituição) |
| tests/bdd | `tests/bdd/gestao-de-pirometros.feature` e `tests/bdd/steps/gestao-de-pirometros.steps.tsx` | criar | — |
| tests/bdd | `tests/bdd/support/fake-api.ts`, `painel-world.tsx`, `tests/bdd/steps/graficos.steps.tsx`, `navegacao.steps.tsx`, `painel-de-temperaturas.feature` | alterar (contrato novo da API; menu com 4 itens; janela do gráfico × miniatura) | — |
| tests/it | `tests/it/wiremock/mappings/pyrometers.json` (alterar), `pyrometer-summary.json`, `pyrometer-save.json` (criar) e `tests/it/adapters/clients/pyrometers.client.spec.ts` (alterar) | alterar/criar | — |
| tests/unit | `tests/unit/adapters/presenters/test-render.tsx` | alterar (novas dependências) | — |

## Mapa requisito → arquivos

| Requisito | Arquivos |
|---|---|
| RF-01 | `SidebarNav.tsx`, `routes.constants.ts`, `app-routes.tsx`, `PyrometersPage.tsx` |
| RF-02 | `PyrometersPage.tsx`, `PyrometerProfileForm.tsx`, `usePyrometers` (já devolve todos), `pyrometers.client.ts` |
| RF-03 | `PyrometerProfileForm.tsx`, `ColorPicker.tsx`, `useSavePyrometer.ts`, `save-pyrometer-profile.use-case.ts`, `pyrometers.client.ts`, `fetch-json.ts`, `profile-rejected.error.ts` |
| RF-04 | `pyrometer-name.model.ts`, `PyrometerCard.tsx`, `TemperatureChart.tsx`, `PyrometerFilter.tsx`, `ReadingsTable.tsx` |
| RF-05 | `pyrometer-profile.constants.ts`, `PyrometerCard.tsx`, `TemperatureChart.tsx`, `PyrometersPage.tsx` |
| RF-06 | `PyrometerCards.tsx`, `PyrometerCard.tsx`, `Sparkline.tsx`, `usePyrometerSummaries.ts`, `list-pyrometer-summaries.use-case.ts`, `duration.model.ts` |
| RF-07 | `PyrometerCard.tsx` (sem variação de aparência; teste prova) |
| RF-08 | `MonitoringPage.tsx`, `PyrometerCard.tsx`, `pyrometer-name.model.ts` (ordem) |
| RF-09 | `ChartPeriodSelect.tsx`, `chart-periods.constants.ts`, `chart-period.model.ts`, `get-readings-series.use-case.ts`, `useReadingsSeries.ts` |
| RF-10 | `series-gap.model.ts`, `TemperatureChart.tsx`, `chart-axis.model.ts`, `reg-date.model.ts` |
| RF-11 | `pyrometer-name.model.ts` (filtro de ativos), `MonitoringPage.tsx`, `ReadingsPage.tsx` |
| RF-12 | `MonitoringPage.tsx`, `PyrometersPage.tsx`, `StateMessage.tsx` (existente) |
| RF-13 | `reg-date.model.ts` (`formatRegDate`), `i18n.tool.ts`, `text-keys.constants.ts` |
| RF-14 | `useSavePyrometer.ts` (invalida a lista de pirômetros) |
| RNF-01 | teste de desempenho do gráfico com 10 pirômetros e 10.000 pontos em `TemperatureChart.spec.tsx` |
| RNF-02 | `reg-date.model.ts` (sem `Date`), `reg-date.model.spec.ts` |
| RNF-03 | classes do grid de cards (colunas fluidas); conferido na tela e em teste do grid |
| RNF-04 | `PyrometerCard.tsx`, `TemperatureChart.tsx` (legenda) |
| RNF-05 | ESLint/`grep` do bundle no `make validate` (padrão já existente); sem endereço fixo |
| RNF-06 | `make cover` |

## Contrato entre camadas

- **Página → hook → caso de uso → client → `fetch`.** Componente não importa client nem `fetch` (P5). Casos de uso recebem o client por interface.
- **`GetReadingsSeriesUseCase.execute(pyrometerId, periodKey = 'today')`** resolve a janela com `chart-period.model` e chama `IReadingsClient.getSeries(janela, pyrometerId)`.
- **`SavePyrometerProfileUseCase.execute(id, profile)`** chama `IPyrometersClient.saveProfile`; erros: `ProfileRejectedError` (404/422) ou `ReadingsUnavailableError`.
- **Cor e nome**: as páginas passam a lista de `PyrometerDto` aos componentes de apresentação; a regra do nome mostrado fica em `core/domain/models`.
- **Datas**: `reg_date` continua texto; só `toEpochSeconds`/`formatEpoch` o tocam, por aritmética de calendário.

## Dependências externas

| Dependência | Versão | Justificativa | Simulada nos testes por |
|---|---|---|---|
| Nenhuma nova | — | Recharts, TanStack Query, lucide e shadcn já existem | WireMock nos `it`; `FakeApi` nos BDD; mocks gerados nos unitários |

## Impacto no contrato de operação

Nenhum alvo novo no `Makefile` e nenhum serviço novo. `make api-types http://host.docker.internal:8000/api/openapi.json` regenera os tipos com a API no ar.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Os BDD existentes usam `getByRole('status')` e `getByRole('button', {name:'Tentar de novo'})` no singular | alta | Estado único por tela (decisão acima) |
| ~~A miniatura gera uma 2ª chamada de série~~ | — | Resolvido: miniatura e chamada extra removidas |
| Aritmética de calendário errada (anos bissextos) | média | Testes com 29/02/2028, virada de ano e 31/10→01/11 |
| Recharts em jsdom não mede layout | média | Tamanho fixo nos testes, como já feito |
| Salvar congela a cor padrão | baixa | Registrado; a cor escolhida é a que a API devolve |
| ~~10 cards com miniatura pesam no desenho~~ | — | Resolvido: sem miniatura |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Tudo por `make` no serviço `dev`; nenhum alvo novo |
| Arquitetura limpa | `core` não importa `adapters`/`infra`; `t()` (infra) só é chamado em `adapters/presenters`; `fetch` só em `adapters/clients/` |
| Testes provam a entrega | Todo arquivo de produção com lógica tem teste espelhado; BDD para os 16 critérios; IT contra WireMock; cobertura ≥ 90% |
| Simplicidade defensável | Sem biblioteca nova; padrões recusados listados |
| Autoria / Idioma | Artefatos em português; sem atribuição a ferramenta de IA |
| P1 — português via chaves | Todo texto novo entra em `text-keys.constants.ts` + `i18n.tool.ts`, inclusive nomes das 12 cores |
| P2 — `reg_date` sem fuso | Eixo e rótulos por aritmética, sem `Date` sobre `reg_date` |
| P3 — sem autenticação | Nenhum login; qualquer um edita (registrado na spec) |
| P4 — endereço da API em runtime | Só `/api` relativo |
| P5 — rede só por client | `PUT` em `adapters/clients/`; `api-schema.d.ts` só gerado |
| P6 — código gerado fora da cobertura | Nada de lógica em `ui/`; os novos componentes ficam em `presenters/` |
| P7 — sem segredos | Nenhum |
