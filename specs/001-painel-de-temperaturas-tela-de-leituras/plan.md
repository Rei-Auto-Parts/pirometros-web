# Plano de implementação — Painel de temperaturas (Acompanhamento e Leituras)

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Contrato com a API | `GET /api/pyrometers`, `GET /api/readings` (`start`, `end`, `dev_id`, `page`, `page_size`) e `GET /api/readings/series` (`start`, `end`, `dev_id`) | Montar a série a partir de `/readings` | A API já entrega a série pronta por pirômetro; evita paginar 10.000 leituras no navegador (RNF-01) |
| Tipos da API | Regerar `api-schema.d.ts` com `make api-types` (API no ar) e importar `components['schemas']` nos clients | Escrever os tipos à mão | P5/P6: arquivo gerado, nunca editado à mão. **Pré-requisito**: a `pirometros-api` precisa estar no ar |
| Datas (`measured_at`) | Tratadas como **texto** `YYYY-MM-DDTHH:mm:ss`. Formatação `dd/MM/yyyy HH:mm` por fatiamento de string, em `core/domain/models/reg-date.model.ts` | `Date`, `Intl.DateTimeFormat`, date-fns/dayjs | P2 proíbe `Date` sobre `reg_date`; RNF-02 exige igualdade com o gravado |
| Eixo X do gráfico | Segundos desde 00:00, extraídos da string (`reg-date.model.ts`); rótulo do eixo e do tooltip formatados de volta para `HH:mm` | Eixo de tempo com `Date` | Mantém P2. Como o Acompanhamento é sempre o dia de hoje, basta a hora do dia |
| "Hoje" | `reading-period.model.ts` lê o dia pelos getters **locais** (`getFullYear/getMonth/getDate`) do relógio do navegador e monta `YYYY-MM-DDT00:00:00` a `T23:59:59` | Pedir o dia à API | Só descobre o dia; não converte `reg_date`. Ver Riscos |
| Seleção de período (RF-04) | Dois `<input type="datetime-local">`. Fim enviado como `HH:mm:59`, para a medição do minuto escolhido entrar no período | Duas entradas de data e hora separadas | Valor já vem sem fuso, no formato que a API aceita (`NaiveDatetime`) |
| Filtro de pirômetro (RF-03, RF-07) | Um único pirômetro, `<select>` nativo estilizado em `adapters/presenters/components/`, opção "Todos" que omite `dev_id`. Opções vêm de `/pyrometers` | `Select` do shadcn (acrescenta `@radix-ui/react-select`) | KISS: a spec pede filtro simples |
| Paginação (RF-05) | Servidor: `page` + `page_size=50` (constante em `core/domain/constants/readings.constants.ts`). Controles Anterior/Próxima e "página X de Y" | Rolagem infinita, paginação no cliente | Spec pede paginação; a API pagina e ordena por data da medição, sem repetição |
| Estado de servidor | TanStack Query, mesmo padrão de `useHealth`: um hook por consulta. `queryKey` inclui período, pirômetro e página | Estado local com `useEffect` | Já é a stack; dá "tentar de novo" via `refetch` (RF-08) |
| Atualização automática (RF-13) | `refetchInterval` de 5 min (`REFRESH_INTERVAL_MS = 300_000`, em `readings.constants.ts`) nos hooks `useReadings` e `useReadingsSeries`; a `queryKey` não muda no refresh, então filtro, período e página são preservados. O TanStack mantém os dados anteriores na tela durante o refresh (sem piscar) | `setInterval` manual, WebSocket/SSE | O sincronizador publica a cada 5 min; polling na mesma cadência é o suficiente. A Saúde do sistema mantém os 30 s atuais |
| "Hoje" que acompanha a virada do dia (RF-13) | O dia é resolvido **dentro do `queryFn`** a cada consulta (`getTodayPeriod()` chamado pelo caso de uso), e a `queryKey` usa o marcador `'hoje'`, não a data. Nas Leituras, o estado do período é `null` enquanto o usuário não escolheu um (= hoje); ao escolher, guarda o período explícito | Guardar a data de hoje no estado | Sem isso, uma tela aberta de madrugada ficaria presa no dia anterior |
| Leitura sem temperatura (RF-14) | A garantia vem da **API**: `/readings` e `/readings/series` devem excluir `reg_temperature` nulo (assim total e paginação batem). Hoje a API **não** filtra. O front, por segurança, descarta pontos com temperatura nula antes de montar a série (uma linha não plota nulo), mas **não** filtra a lista no cliente | Filtrar a lista no cliente | Filtro no cliente quebraria `total`/paginação. **Dependência**: mudança na `pirometros-api` (ver Riscos) |
| Período inválido (RF-04) | `reading-period.model.ts` expõe `isPeriodValid(start, end)` (compara os textos naive, sem `Date`); inválido → aviso no `PeriodFilter` e nenhuma chamada | Deixar a API responder erro | Evita consulta inútil; spec manda avisar |
| Campos ausentes (RF-06) | `ReadingsTable` mostra o serial quando o pirômetro não tem nome e "—" para bateria/local ausentes | Esconder a coluna, texto vazio | Padrão da spec |
| Erro / vazio / carregando (RF-08) | Client lança `ReadingsUnavailableError` (rede ou HTTP não-2xx); o presenter mostra aviso com botão "Tentar de novo"; lista/gráfico vazios mostram "nenhuma leitura no período" / "nenhuma leitura hoje" | Tratar no componente | Erro tratado na borda; a tela continua utilizável (o menu e o resto seguem) |
| Tema (RF-10) | Hook `useTheme` alterna a classe `dark` no `<html>`; abre sempre no claro. Acrescentar o bloco `.dark { … }` em `globals.css` (hoje só há `@custom-variant dark`, sem os valores) | Persistir em `localStorage`, seguir o sistema | Spec: "abre no tema claro". Persistir seria requisito novo |
| Texto (RF-09, P1) | Todas as chaves novas em `text-keys.constants.ts`, valores em `i18n.tool.ts` | Literal no componente | P1 |
| Rotas (RF-01, RF-12) | `/` = Acompanhamento, `/leituras` = Leituras, `/saude` = Saúde do sistema | — | Menu lateral com três itens; Acompanhamento é a inicial |
| Menu lateral (RF-01, RF-11) | `SidebarNav` com `NavLink` (item atual marcado por `aria-current`) e ícones do `lucide-react` (já instalado). Estado expandido/recolhido em `useState` no `AppLayout`, começa expandido; recolhido, o `<aside>` encolhe para a largura do ícone e o nome do item fica só em `aria-label`/`title`. Botão de recolher/expandir no topo do menu. O estado vive no `AppLayout`, que fica montado ao trocar de rota, então se mantém entre telas (RF-11); não é persistido. Uso só por clique, sem requisito de teclado | Biblioteca de sidebar do shadcn, persistir o estado | KISS; spec manda abrir expandido, sem persistência |
| Página inicial atual (`HomePage`, saúde) | **Renomeada** para `HealthPage` e movida para a rota `/saude` (RF-12), com o mesmo conteúdo; `useHealth`, `GetHealthUseCase`, `HealthClient`, DTO, erro e testes de saúde **ficam**. A saúde continua com `refetchInterval` próprio | Remover a saúde; manter em `/` | Decisão do usuário em 2026-11-04 |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| Injeção de dependência via contexto (já existente) | `AppDependencies` recebe os três casos de uso novos | Componente não conhece client nem `fetch` | Um campo a mais no contexto por caso de uso |
| Adapter | Clients convertem o JSON da API (`snake_case`) para os DTOs do domínio | O domínio não depende do formato da API | Um mapeamento por client |

**Considerados e recusados**

| Padrão | Motivo |
|---|---|
| Repository no front | O client já é a fronteira de saída; uma camada a mais não resolve problema presente |
| Strategy para o formato de data | Há um único formato (`dd/MM/yyyy HH:mm`); seria antecipação |
| Store global (Redux/Zustand) | O TanStack Query já guarda o estado de servidor; o resto é estado local de tela |
| Facade sobre os três casos de uso | Cada tela usa os seus; não há orquestração a esconder |

## Arquivos a criar ou alterar

Todos sob `app/`. Teste unitário espelhado em `app/tests/unit/<mesmo caminho>` (convenção do projeto: `*.spec.ts(x)`).
Requisitos atendidos entre colchetes.

### core/domain

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `core/domain/dtos/reading.dto.ts` [RF-06] | criar | — (tipo puro) |
| core/domain | `core/domain/dtos/readings-page.dto.ts` [RF-05] | criar | — (tipo puro) |
| core/domain | `core/domain/dtos/pyrometer.dto.ts` [RF-03, RF-07] | criar | — (tipo puro) |
| core/domain | `core/domain/dtos/pyrometer-series.dto.ts` [RF-02] | criar | — (tipo puro) |
| core/domain | `core/domain/dtos/reading-period.dto.ts` [RF-04] | criar | — (tipo puro) |
| core/domain | `core/domain/errors/readings-unavailable.error.ts` [RF-08] | criar | `tests/unit/core/domain/errors/readings-unavailable.error.spec.ts` |
| core/domain | `core/domain/models/reg-date.model.ts` (formatar `dd/MM/yyyy HH:mm`, segundos do dia, rótulo `HH:mm`, fim `:59`) [RF-09, RNF-02] | criar | `tests/unit/core/domain/models/reg-date.model.spec.ts` |
| core/domain | `core/domain/models/reading-period.model.ts` (dia de hoje 00:00–23:59, `isPeriodValid`) [RF-02, RF-04, RF-13] | criar | `tests/unit/core/domain/models/reading-period.model.spec.ts` |
| core/domain | `core/domain/constants/readings.constants.ts` (`READINGS_PAGE_SIZE = 50`, `REFRESH_INTERVAL_MS = 300_000`) [RF-05, RF-13] | criar | — (constante) |
| core/domain | `core/domain/constants/routes.constants.ts` (`monitoring: '/'`, `readings: '/leituras'`, `health: '/saude'`; `home` sai) [RF-01, RF-12] | alterar | — |
| core/domain | `core/domain/constants/query-keys.constants.ts` (acrescenta `pyrometers`, `readings`, `series`; `health` fica) | alterar | — |
| core/domain | `core/domain/constants/text-keys.constants.ts` (chaves novas: menu, itens, recolher/expandir, telas; as de saúde ficam; `homeTitle`/`homeDescription` passam a ser da Saúde do sistema) [RF-09, P1] | alterar | — |

### interfaces

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| interfaces | `interfaces/adapters/clients/i-readings.client.ts` | criar | — |
| interfaces | `interfaces/adapters/clients/i-pyrometers.client.ts` | criar | — |
| interfaces | `interfaces/core/application/i-list-readings.use-case.ts` | criar | — |
| interfaces | `interfaces/core/application/i-get-readings-series.use-case.ts` | criar | — |
| interfaces | `interfaces/core/application/i-list-pyrometers.use-case.ts` | criar | — |

### core/application

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/application | `core/application/list-readings.use-case.ts` [RF-04, RF-05, RF-07] | criar | `tests/unit/core/application/list-readings.use-case.spec.ts` |
| core/application | `core/application/get-readings-series.use-case.ts` [RF-02, RF-03] | criar | `tests/unit/core/application/get-readings-series.use-case.spec.ts` |
| core/application | `core/application/list-pyrometers.use-case.ts` [RF-03, RF-07] | criar | `tests/unit/core/application/list-pyrometers.use-case.spec.ts` |

### adapters/clients

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| adapters/clients | `adapters/clients/api-schema.d.ts` | **regerar** (`make api-types`), nunca à mão | fora da cobertura (P6) |
| adapters/clients | `adapters/clients/readings.client.ts` (`/readings` e `/readings/series`) | criar | `tests/unit/adapters/clients/readings.client.spec.ts` + `tests/it/adapters/clients/readings.client.spec.ts` |
| adapters/clients | `adapters/clients/pyrometers.client.ts` | criar | `tests/unit/adapters/clients/pyrometers.client.spec.ts` + `tests/it/adapters/clients/pyrometers.client.spec.ts` |
| tests/it | `tests/it/wiremock/mappings/pyrometers.json`, `readings.json`, `readings-series.json`, `readings-unavailable.json` | criar | — (insumo do `make it`) |

### adapters/presenters

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| presenters/ui | `adapters/presenters/ui/button.tsx`, `input.tsx`, `table.tsx`, `alert.tsx` (shadcn, copiados do registro) | criar | fora da cobertura (P6) |
| presenters/hooks | `hooks/usePyrometers.ts` | criar | `tests/unit/adapters/presenters/hooks/usePyrometers.spec.tsx` |
| presenters/hooks | `hooks/useReadings.ts` | criar | `tests/unit/adapters/presenters/hooks/useReadings.spec.tsx` |
| presenters/hooks | `hooks/useReadingsSeries.ts` | criar | `tests/unit/adapters/presenters/hooks/useReadingsSeries.spec.tsx` |
| presenters/hooks | `hooks/useTheme.ts` [RF-10] | criar | `tests/unit/adapters/presenters/hooks/useTheme.spec.tsx` |
| presenters/components | `components/PyrometerFilter.tsx` [RF-03, RF-07] | criar | `tests/unit/adapters/presenters/components/PyrometerFilter.spec.tsx` |
| presenters/components | `components/PeriodFilter.tsx` (aviso de período inválido) [RF-04] | criar | `tests/unit/adapters/presenters/components/PeriodFilter.spec.tsx` |
| presenters/components | `components/TemperatureChart.tsx` (Recharts, uma `Line` por pirômetro) [RF-02] | criar | `tests/unit/adapters/presenters/components/TemperatureChart.spec.tsx` |
| presenters/components | `components/ReadingsTable.tsx` (serial no lugar do nome, "—" nos ausentes) [RF-06] | criar | `tests/unit/adapters/presenters/components/ReadingsTable.spec.tsx` |
| presenters/components | `components/Pagination.tsx` [RF-05] | criar | `tests/unit/adapters/presenters/components/Pagination.spec.tsx` |
| presenters/components | `components/StateMessage.tsx` (vazio, carregando, indisponível + "Tentar de novo") [RF-08] | criar | `tests/unit/adapters/presenters/components/StateMessage.spec.tsx` |
| presenters/components | `components/SidebarNav.tsx` (itens, `NavLink`, ícones, modo recolhido, botão recolher/expandir) [RF-01, RF-11] | criar | `tests/unit/adapters/presenters/components/SidebarNav.spec.tsx` |
| presenters/components | `components/ThemeToggle.tsx` [RF-10] | criar | `tests/unit/adapters/presenters/components/ThemeToggle.spec.tsx` |
| presenters/pages | `pages/HealthPage.tsx` (renomeia `HomePage.tsx`; mesmo conteúdo) [RF-12] | renomear | `tests/unit/adapters/presenters/pages/HealthPage.spec.tsx` (renomeia `HomePage.spec.tsx`) |
| presenters/pages | `pages/MonitoringPage.tsx` (Acompanhamento) [RF-02, RF-03, RF-08] | criar | `tests/unit/adapters/presenters/pages/MonitoringPage.spec.tsx` |
| presenters/pages | `pages/ReadingsPage.tsx` (Leituras) [RF-04…RF-08] | criar | `tests/unit/adapters/presenters/pages/ReadingsPage.spec.tsx` |
| presenters/layout | `layout/AppLayout.tsx` (usa `SidebarNav`, guarda o estado recolhido/expandido, `ThemeToggle`) [RF-01, RF-10, RF-11] | alterar | `tests/unit/adapters/presenters/layout/AppLayout.spec.tsx` (alterar) |
| presenters/dependencies | `dependencies/AppDependencies.tsx` (3 casos de uso novos; `getHealthUseCase` fica) | alterar | `tests/unit/adapters/presenters/dependencies/AppDependencies.spec.tsx` (alterar) |
| presenters/styles | `styles/globals.css` (tokens `.dark`) [RF-10] | alterar | — (CSS) |

### infra

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| infra/init | `infra/init/ioc.init.tsx` (liga clients → casos de uso) | alterar | fora da cobertura (como `ioc_init`) |
| infra/web | `infra/web/web-entry.tsx` (rotas `/`, `/leituras` e `/saude`) [RF-01, RF-12] | alterar | `tests/unit/infra/web/web-entry.spec.tsx` (alterar) |
| infra/tools | `infra/tools/i18n.tool.ts` (textos pt-BR das chaves novas) [RF-09] | alterar | `tests/unit/infra/tools/i18n.tool.spec.ts` (alterar) |

### BDD (critérios de aceite da spec)

| Camada | Arquivo | Ação |
|---|---|---|
| tests/bdd | `tests/bdd/painel-de-temperaturas.feature` — os 29 cenários da spec (inclui menu, Saúde do sistema, atualização automática e leitura sem temperatura), `# language: pt` | criar |
| tests/bdd | `tests/bdd/steps/painel-de-temperaturas.steps.tsx` | criar |
| tests/bdd | `tests/bdd/saude-do-sistema.feature` e `steps/saude-do-sistema.steps.tsx` | **alterar**: abrir a Saúde do sistema pela rota `/saude`; remover o cenário "Menu lateral vazio" (o menu agora tem itens) |

## Contrato entre camadas

```
Página/Componente (adapters/presenters)
   └─ hook (useReadings, useReadingsSeries, usePyrometers)      TanStack Query
        └─ caso de uso (core/application)                        via useDependencies()
             └─ client (adapters/clients)                        único lugar com fetch, base `/api`
                  └─ API (/api/readings, /readings/series, /pyrometers)
```

- O que trafega: o período como texto naive (`YYYY-MM-DDTHH:mm:ss`), o serial do pirômetro (`dev_id`), `page`/`page_size`; volta `ReadingsPageDto`, `PyrometerSeriesDto[]`, `PyrometerDto[]`. O client converte `snake_case` para os DTOs.
- Onde o erro é tratado: o client lança `ReadingsUnavailableError` (falha de rede ou HTTP fora de 2xx); o caso de uso **não** engole o erro (diferente da saúde, aqui não há valor padrão com sentido); o hook o expõe em `isError`; o componente `StateMessage` mostra o aviso e chama `refetch`.
- `core` não importa `adapters` nem `infra`; os casos de uso dependem só das interfaces em `interfaces/`.
- O endereço da API nunca aparece no código: os clients usam só `/api` (RNF-03, P4).

## Dependências externas

| Dependência | Versão | Justificativa | Simulada nos testes por |
|---|---|---|---|
| `recharts` | ^3.10.1 (já instalada) | Gráfico de linhas (RF-02) | em teste unitário, o `ResponsiveContainer` recebe largura/altura fixas |
| `@tanstack/react-query`, `react-router-dom` | já instaladas | Estado de servidor e rotas | — |
| `pirometros-api` | contrato `/api/readings`, `/readings/series`, `/pyrometers`; **precisa excluir leituras sem temperatura (RF-14)** | Fonte dos dados | WireMock nos testes de integração; mock da interface nos unitários |
| shadcn/ui (`button`, `input`, `table`, `alert`) | copiados do registro | Componentes visuais | — |

Nenhuma dependência npm nova.

## Impacto no contrato de operação

- **Makefile / compose**: nenhum alvo ou serviço novo. `make api-types` já existe e será usado uma vez, com a API no ar.
- **WireMock**: novos mapeamentos em `tests/it/wiremock/mappings/` para o `make it`.
- Variável de ambiente nova: nenhuma. `API_URL` segue só no nginx.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| "Hoje" depender do fuso do navegador, se o computador do gestor não estiver em America/Sao_Paulo | baixa (rede interna, máquinas locais) | Usar só os getters locais do relógio; documentar. Sem biblioteca de fuso (P2) |
| `<input type="datetime-local">` exibir a data no formato do navegador, e não em `dd/MM/yyyy HH:mm` (RF-09) | média | Navegador em pt-BR e `lang="pt-BR"` no `index.html` exibem `dd/mm/aaaa hh:mm`; se não bastar, trocar por campos de texto com máscara em outra tarefa |
| Recharts no jsdom não calcula tamanho e o gráfico não renderiza no teste | alta | Testar com dimensões fixas e conferir as `Line`/dados; o gráfico real é verificado no `make bdd`/`make run` |
| Menu recolhido: item só com ícone fica ambíguo | baixa | `aria-label` e `title` em cada item; sem requisito de teclado (fora de escopo) |
| A API devolve leituras sem temperatura e o front passa a exibi-las, ferindo RF-14 | **alta (hoje acontece)** | Mudança na `pirometros-api` (`WHERE reg_temperature IS NOT NULL` em listagem, total e série, com teste) como pré-requisito de `/bu:implement`; é outra feature/repositório, a abrir antes |
| Atualização da página 2+ deslocar linhas quando chegam leituras novas (a lista cresce pelo topo) | média | Aceito: a lista é ordenada pela mais recente; o usuário vê os dados atuais. Se incomodar, fica para outra spec |
| Testes com temporizador (5 min) lentos ou instáveis | média | `vi.useFakeTimers()` nos testes dos hooks e das páginas; nenhuma espera real |
| "Drill out" ter sido interpretado como menu recolhível, e ser outra coisa | média | Registrado em Esclarecimentos da spec como interpretação; confirmar antes de implementar |
| `/readings/series` recusar mais de 31 dias | nula para a spec | O Acompanhamento pede sempre 1 dia; a lista (`/readings`) não tem esse limite |
| 10.000 leituras no gráfico lentas (RNF-01) | baixa | Recharts com `dot={false}` e `isAnimationActive={false}`; medir no `make run` |
| `api-schema.d.ts` desatualizado se a API mudar | baixa | Regerar com `make api-types`; o `make lint` (`tsc`) acusa divergência de tipo |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Tudo roda por `make` no serviço `dev`; nenhum alvo novo; `make validate` é o critério de pronto. Nada de `npm`/`npx` direto |
| Arquitetura limpa | Código só em `app/`; `core` (casos de uso, DTOs, erros, models) não importa `adapters`/`infra`; abstrações em `interfaces/` espelhando a hierarquia; `fetch` só em `adapters/clients/`; a montagem fica no `ioc.init.tsx` |
| Testes provam a entrega | Todo arquivo de produção com lógica tem teste espelhado em `tests/unit`; clients têm também `tests/it` com WireMock; os 29 cenários da spec viram `tests/bdd`; cobertura ≥ 90% (`ui/` e `api-schema.d.ts` fora, P6); dependências injetadas mockadas a partir das interfaces |
| Simplicidade defensável | Sem biblioteca nova, sem store global, sem Facade/Strategy; `<select>` nativo; tema sem persistência; padrões recusados registrados acima |
| Autoria | Nenhum artefato menciona ferramenta de IA |
| Idioma | Plano em pt-BR; textos de interface por chave em pt-BR; BDD com `# language: pt` (DADO/QUANDO/ENTÃO/MAS); identificadores em inglês |
| P1 — Interface em pt-BR | Toda string visível entra por `TEXT_KEYS` + `i18n.tool.ts` |
| P2 — `reg_date` sem fuso | `measured_at` é texto; formatação por fatiamento; nenhum `Date` sobre ele; "hoje" usa só getters locais |
| P3 — Sem autenticação | Nada de login, token ou sessão |
| P4 — Endereço da API em runtime | Só o caminho relativo `/api`; sem `VITE_*`; nginx continua com `API_URL` |
| P5 — Rede só por client | `fetch` apenas em `readings.client.ts` e `pyrometers.client.ts`; `api-schema.d.ts` gerado, não editado |
| P6 — Gerado fora da cobertura | Componentes novos de `ui/` sem lógica própria; lógica nos `components/` e `core/` |
| P7 — Sem segredos | Nenhum segredo; `.env.example` inalterado |
