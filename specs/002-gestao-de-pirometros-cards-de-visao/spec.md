# Especificação — Gestão de pirômetros, cards de visão geral e gráfico melhorado

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Depende da spec 002 da `pirometros-api` (complemento, resumo e leituras sem temperatura).

## Problema

O Acompanhamento mostra só um gráfico de linhas com o nome curto que vem do aparelho
(ex.: "PI-12"). O gestor não consegue, num relance, ver a última temperatura de cada pirômetro,
saber há quanto tempo cada um não envia leitura, distinguir os aparelhos por cor nem registrar o que
sabe sobre cada um. O gráfico só mostra o dia de hoje e liga com uma linha pontos separados por
horas sem leitura, escondendo falhas de comunicação.

## Objetivo

1. Uma tela **Pirômetros** para dar apelido, cor e observação a cada pirômetro existente e
   marcar os aposentados como inativos.
2. No **Acompanhamento**, um **card por pirômetro** com a última temperatura, a bateria e há
   quanto tempo ele não envia leitura, acima do gráfico.
3. Um **gráfico melhor**: período escolhível, cor de cada pirômetro e uma linha contínua com um ponto em cada leitura.

## Fora de escopo

- Criar ou apagar pirômetro: a lista vem dos dados; só se edita o que existe.
- Faixa de temperatura mín/máx, alertas, e-mail e qualquer notificação.
- Destaque ou alerta por tempo sem leitura ou por bateria baixa: o tempo e a bateria são só informação.
- Seletor livre de cor: a cor é escolhida de uma paleta fixa.
- Exportação (CSV ou outra).
- Histórico de alterações e registro de quem alterou.
- Autenticação, login, perfis (constituição P3).
- Período livre (início e fim) no gráfico: só os períodos prontos do RF-09.
- Mostrar leituras sem temperatura, ou estimar valores ausentes.
- Lembrar escolhas (período, filtro) depois de recarregar a página.
- Tela para a TV do laboratório.
- Miniatura (sparkline) das temperaturas nos cards: **removida a pedido do usuário** (aparecia em branco); o gráfico principal continua sendo o lugar das séries.
- Código do local (`reg_place`): não é exibido nem tratado nesta feature. **Feature futura:** cadastrar e editar "locais" e atribuir a cada pirômetro o significado do código (não criar endpoint, tabela nem tela agora).

## Alterações em relação à spec 001 do front

Esta spec **substitui** três decisões da 001, e só elas:

- O Acompanhamento deixa de ser "sempre hoje": passa a ter períodos (RF-09), com "Hoje" como padrão (altera RF-02).
- "Saúde dos pirômetros (última leitura, bateria)" deixa de ser fora de escopo: entra nos cards (RF-06).
- A cor do pirômetro passa a ser permitida; cores **por faixa de temperatura** continuam fora.

O restante da 001 vale, inclusive RF-13 (atualização periódica) com o intervalo de 5 minutos mantido.

## Personas e cenários de uso

- **Gestor**: abre o Acompanhamento, vê os cards e vê de relance a última temperatura, a bateria e há quanto tempo
  cada pirômetro não envia leitura; clica no card e o gráfico mostra só aquele aparelho.
- **Gestor, na tela Pirômetros**: dá o apelido "Forno 2", escolhe a cor, anota "termopar trocado
  em 03/11" e inativa um aparelho aposentado.
- **Qualidade**: escolhe "Últimas 6 horas" no gráfico para investigar uma oscilação recente.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O menu lateral deve ganhar o item Pirômetros, que abre a tela de gestão. | obrigatório |
| RF-02 | A tela Pirômetros deve listar todos os pirômetros existentes (ativos e inativos) numa **lista compacta**, uma linha por pirômetro, em ordem alfabética pelo nome mostrado (RF-04). Cada linha mostra a cor (com o nome escrito ao lado), o nome mostrado com a TAG em peso normal e o apelido em destaque, o serial em texto pequeno, a observação truncada em uma linha (com o texto inteiro numa dica) e um selo Ativo/Inativo; a linha de um pirômetro inativo aparece atenuada. *(Emenda de 2026-11-05: redesenho.)* | obrigatório |
| RF-03 | A tela Pirômetros deve permitir editar, no **painel de edição** do pirômetro selecionado, o apelido (contador `n/40`), a cor, a observação (contador `n/500`) e a situação (interruptor "Ativo"). **Salvar** só fica habilitado quando há alteração e os campos são válidos; **Descartar alterações** só aparece quando há alteração. Salvar mostra confirmação junto dos botões; erro de validação (422), de cor em uso (409) ou da API mostra mensagem clara no painel e preserva o que o usuário digitou. Não há botão para criar ou excluir pirômetro. *(Emenda de 2026-11-05.)* | obrigatório |
| RF-04 | O nome mostrado de um pirômetro, em todas as telas, é **"TAG - APELIDO"** (ex.: "PI-14 - Forno 1"), com TAG = nome do aparelho (ou o serial, se não houver nome); sem apelido, só a TAG. O apelido não substitui a TAG. Vale em cards, legenda e tooltip do gráfico, filtros do Acompanhamento e das Leituras, coluna de pirômetro das Leituras e tela Pirômetros. *(Emenda de 2026-11-05: antes o apelido substituía o nome do aparelho.)* | obrigatório |
| RF-05 | A cor do pirômetro, escolhida de uma paleta fixa de 12 cores, deve identificá-lo nos cards, na linha do gráfico e na tela Pirômetros. O nome do pirômetro está sempre escrito junto da cor: a cor nunca é a única identificação. | obrigatório |
| RF-06 | O Acompanhamento deve mostrar, acima do gráfico, um card por pirômetro ativo com: nome (RF-04), cor, **última temperatura em display de 7 segmentos** (dígitos inteiros e a unidade, com aparência de mostrador de forno, **em tamanho de destaque (cerca de 33% maior que o planejado antes) sem quebrar a grade de cards lado a lado**, com **dígitos acesos em vermelho de LED e segmentos apagados em vermelho bem tênue**, cor fixa (não é alerta por faixa de temperatura e não depende da cor do pirômetro), legível com bom contraste em tema claro e escuro e com o valor real em texto acessível; sem leitura, traços `---` no mesmo estilo), data da última leitura (`dd/MM/yyyy HH:mm`), **bateria como porcentagem** (ex.: `63%`) com uma **barra horizontal fina** proporcional de 0 a 100 (valor fora desse intervalo é limitado na barra; valor nulo mostra "—" e nenhuma barra), tempo sem leitura em minutos (ou horas e minutos acima de 60). O card **não** tem miniatura (linha) das temperaturas e não mostra o código do local. *(Emenda de 2026-11-05: miniatura removida a pedido do usuário, que a via em branco.)* **Premissa: unidade da bateria presumida %, a confirmar.** *(Emenda de 2026-11-05.)* | obrigatório |
| RF-07 | O tempo sem leitura é só informação: o card não muda de aparência, não alerta e não recebe destaque por falta de leitura ou por bateria baixa, por maior que seja o tempo. | obrigatório |
| RF-08 | Os cards ficam em ordem alfabética pelo nome mostrado. Clicar num card deve filtrar o gráfico para aquele pirômetro; clicar de novo, ou escolher "Todos" no filtro, volta a mostrar todos. O filtro de pirômetro e o card selecionado ficam sempre em sincronia. | obrigatório |
| RF-09 | O gráfico deve permitir escolher o período entre Última hora, Últimas 6 horas, Últimas 24 horas, Hoje (padrão) e Últimos 3 dias, sem recarregar a página e mantendo o pirômetro filtrado. *(Emenda de 2026-11-05: o período define **quais leituras são buscadas**; o eixo de horário não cobre mais a janela inteira, ver RF-20.)* | obrigatório |
| RF-10 | O gráfico deve desenhar uma linha por pirômetro na cor dele, **sempre ligando todas as leituras do pirômetro com uma linha contínua, sem interrupção por intervalo**, de traço mais grosso (≈ 2,5 px) com pontas e junções arredondadas e **suavizada de forma monotônica**: a curva passa por todas as leituras e nunca ultrapassa os valores medidos entre duas leituras, isto é, não cria picos nem vales inventados;, e mostrar **um ponto pequeno em cada leitura** (maior ao passar o mouse), na cor da linha. Leituras espaçadas por minutos ou horas continuam visíveis. O ponto tem raio 3 e passa a raio 2 quando há mais de 200 pontos visíveis; **acima de 500 pontos visíveis (somando as séries) os pontos individuais deixam de ser desenhados** (desempenho e para não virar uma mancha, como nos 3 dias), mantendo a linha suave e grossa; em qualquer caso, passar o mouse mostra a leitura (dica) e destaca o ponto ativo. *(Emenda de 2026-11-05: substitui a lacuna de 15 minutos, que escondia leituras isoladas.)* | obrigatório |
| RF-11 | Pirômetros inativos não aparecem nos cards, no gráfico nem no filtro do Acompanhamento. Continuam na tela Pirômetros e disponíveis no filtro das Leituras, para consultar o histórico. | obrigatório |
| RF-12 | Os cards, o gráfico e a tela Pirômetros devem indicar que estão carregando, informar quando não há dados e quando a API está indisponível, permitindo tentar de novo. Com a API indisponível, o menu, o tema e o recolher do menu continuam funcionando. | obrigatório |
| RF-13 | Toda data aparece como `dd/MM/yyyy HH:mm`, sem conversão de fuso, e todo texto é em português do Brasil. | obrigatório |
| RF-14 | Depois de salvar um complemento, os cards, o gráfico e os filtros passam a mostrar o novo apelido e a nova cor sem recarregar a página. | obrigatório |
| RF-20 | Os eixos do gráfico se ajustam aos dados exibidos, para a linha ser legível. **Eixo de temperatura:** vai de `mín − margem` a `máx + margem`, com margem de 5% da amplitude (mínimo 20 °C) e limites arredondados a múltiplos de 50 (ou de 10 quando a faixa total é menor que 200 °C); **nunca parte de 0**. **Eixo de horário:** vai da primeira à última leitura exibida, com folga de 2% da extensão (mínimo 5 minutos) de cada lado, com marcas em passos conforme a duração (5 min, 15 min, 1 h, 3 h ou 12 h). **Sem leituras**, os eixos voltam ao padrão: temperatura automática e horário cobrindo a janela do período. O seletor de período continua definindo quais leituras são buscadas. *(Emenda de 2026-11-05: substitui "o eixo cobre a janela inteira", que espremia leituras em rajadas curtas no topo e em riscos minúsculos.)* | obrigatório |
| RF-21 | A escolha de tema (claro ou escuro) **persiste ao recarregar a página** (F5): fica salva no navegador e é aplicada ao carregar, antes da primeira pintura, sem piscar o tema errado. Sem escolha salva, o sistema abre no claro, como antes. Se o navegador não permitir guardar (armazenamento bloqueado ou indisponível), o tema continua funcionando na sessão, sem erro. *(Emenda de 2026-11-05: substitui "abre sempre no claro" depois de uma escolha.)* | obrigatório |
| RF-15 | Dois pirômetros nunca têm a mesma cor. Na tela Pirômetros, cada cor da paleta usada por **outro** pirômetro (pela cor efetiva que a API devolve, inclusive a padrão) aparece desabilitada, com a indicação de quem a usa ("em uso por PI-13", em texto acessível e em dica). A cor atual do próprio pirômetro continua selecionável. Se a API recusar a gravação por cor já usada (409), a tela mostra mensagem clara em português e preserva o que o usuário digitou. *(Emenda de 2026-11-05.)* | obrigatório |
| RF-16 | Os cards ficam lado a lado, em grade responsiva e compactos: 2 colunas em telas estreitas, 3 a partir de 1024 px e 4 a partir de 1280 px. *(Emenda de 2026-11-05.)* | obrigatório |
| RF-17 | A tela Pirômetros usa **duas colunas** a partir de 1024 px de largura, ocupando toda a largura disponível: a lista à esquerda e o painel de edição fixo (acompanha a rolagem) à direita; abaixo de 1024 px a lista fica em cima e o painel embaixo. O primeiro pirômetro da lista vem selecionado. A linha selecionada tem destaque (fundo e barra lateral na cor do pirômetro) e é marcada como selecionada para leitores de tela. A lista inteira é navegável por teclado (setas, Tab e Enter). O cabeçalho da página é compacto: título e uma linha de descrição. *(Emenda de 2026-11-05.)* | obrigatório |
| RF-18 | O painel mostra a cor como grade compacta de 12 bolinhas (6 por linha), navegável por teclado (setas movem e escolhem; Tab entra e sai do grupo), com a selecionada marcada por anel e sinal de escolhido, e o nome (ou o código) da cor selecionada em texto. A cor em uso por outro pirômetro (RF-15) aparece riscada e atenuada, com dica e texto acessível "em uso por …". *(Emenda de 2026-11-05.)* | obrigatório |
| RF-19 | O sistema não descarta alterações em silêncio: ao tentar trocar de pirômetro na lista com alterações não salvas, a troca fica bloqueada, o painel mostra o aviso "Há alterações não salvas" e a troca acontece quando o usuário salva ou descarta. *(Emenda de 2026-11-05.)* | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Desempenho percebido | cards e gráfico visíveis em ≤ 2 s com 10 pirômetros e 10.000 leituras no período, com a API respondendo em ≤ 500 ms |
| RNF-02 | Datas sem conversão de fuso | 100% das datas exibidas iguais às devolvidas pela API |
| RNF-03 | Uso em tela de computador | sem rolagem horizontal da página em 1366 px de largura, com 10 cards |
| RNF-04 | Cor nunca é a única informação | 100% dos cards e das linhas do gráfico trazem o nome do pirômetro escrito |
| RNF-05 | Endereço da API | 0 ocorrências do endereço da API no código entregue ao navegador |
| RNF-06 | Cobertura de testes | ≥ 90% |
| RNF-07 | Tela Pirômetros em 1366 × 768 | sem rolagem horizontal da página e, com 10 pirômetros, lista e painel cabem sem rolagem da página (a lista rola por dentro se passar de 10) |
| RNF-08 | Teclado na tela Pirômetros | 100% das ações (escolher pirômetro, escolher cor, editar, salvar, descartar) possíveis só com o teclado, com foco visível |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Gestão de pirômetros, cards e gráfico

  Cenário: Menu com Pirômetros
    Quando eu abro o painel
    Então o menu lateral mostra Acompanhamento, Leituras, Pirômetros e Saúde do sistema

  Cenário: Listar pirômetros
    Dado que existem os pirômetros "PI-12" (ativo) e "PI-15" (inativo)
    Quando eu abro a tela Pirômetros
    Então vejo os dois na lista, cada um com nome, serial, cor, situação e observação
    E o primeiro da lista vem selecionado, com o painel de edição aberto
    Mas o pirômetro inativo aparece atenuado

  Cenário: Editar apelido, cor e observação
    Dado que "PI-12" não tem apelido
    E que abro a tela Pirômetros
    Quando eu informo o apelido "Forno 2", escolho uma cor, escrevo uma observação e salvo
    Então vejo a confirmação de que foi salvo
    E a tela mostra "PI-12 - Forno 2" para esse pirômetro

  Cenário: Novo apelido aparece em todo lugar
    Dado que salvei o apelido "Forno 2" para "PI-12"
    Quando eu abro o Acompanhamento
    Então o card, a linha do gráfico e o filtro mostram "PI-12 - Forno 2"
    E as Leituras mostram "PI-12 - Forno 2" na coluna de pirômetro

  Cenário: Nome sem apelido
    Dado que "PI-14" não tem apelido
    Então o nome mostrado é "PI-14"

  Cenário: Erro ao salvar preserva o que foi digitado
    Dado que a API recusa o apelido por ser grande demais
    Quando eu salvo
    Então vejo a mensagem do erro
    Mas o apelido digitado continua no campo

  Cenário: Inativar pirômetro
    Dado que "PI-15" está ativo
    Quando eu seleciono "PI-15" na lista, o marco como inativo e salvo
    Então ele some dos cards, do gráfico e do filtro do Acompanhamento
    Mas continua na tela Pirômetros e no filtro das Leituras

  Cenário: Não há como criar pirômetro
    Quando eu abro a tela Pirômetros
    Então não existe ação para criar nem excluir pirômetro

  Cenário: Card por pirômetro ativo
    Dado que "PI-12" tem a última leitura às 10:05 com 1510 graus e bateria 62
    E que agora são 10:08
    Quando eu abro o Acompanhamento
    Então o card de "PI-12" mostra 1510, a data 10:05, bateria 62% e "3 min sem leitura"
    Mas o card não tem miniatura de temperaturas

  Cenário: Tempo sem leitura é só informação
    Dado que "PI-14" está sem leitura há 10 horas
    Quando eu abro o Acompanhamento
    Então o card de "PI-14" mostra "10 h sem leitura"
    Mas o card não recebe destaque nem alerta

  Cenário: Escolher cor da paleta
    Dado que abro a edição de "PI-12"
    Então a cor é escolhida entre as 12 cores da paleta fixa, em grade de 6 por linha
    Mas não há seletor livre de cor

  Cenário: Clicar no card filtra o gráfico
    Dado que o gráfico mostra "PI-12" e "PI-14"
    Quando eu clico no card de "PI-12"
    Então o gráfico mostra só "PI-12" e o filtro mostra "PI-12"
    Quando eu clico de novo no mesmo card
    Então o gráfico volta a mostrar os dois

  Cenário: Escolher período do gráfico
    Dado que o gráfico mostra o período "Hoje"
    E que filtrei o pirômetro "PI-12"
    Quando eu escolho "Últimas 6 horas"
    Então o gráfico mostra só as seis últimas horas
    E o pirômetro filtrado continua o mesmo

  Cenário: Leituras espaçadas aparecem ligadas por linha com um ponto cada
    Dado que "PI-12" tem leituras às 10:00 e às 12:00 e nenhuma entre elas
    Quando eu vejo o gráfico
    Então a linha de "PI-12" liga a leitura das 10:00 à das 12:00 sem interrupção
    E cada uma das duas leituras aparece como um ponto

  Cenário: Cor do pirômetro
    Dado que "PI-12" tem a cor vermelha escolhida
    Quando eu abro o Acompanhamento
    Então o card e a linha de "PI-12" usam o vermelho
    E o nome "PI-12" está escrito no card e na legenda do gráfico

  Cenário: API indisponível
    Dado que a API não responde
    Quando eu abro o Acompanhamento
    Então vejo a mensagem de erro com a opção de tentar de novo
    Mas o menu e o tema continuam funcionando

  Cenário: Cor em uso por outro pirômetro fica indisponível
    Dado que "PI-14" usa a cor vermelha
    E que abro a edição de "PI-12"
    Então a cor vermelha aparece desabilitada com a indicação "em uso por PI-14"
    Mas a cor atual de "PI-12" continua selecionável

  Cenário: API recusa cor já em uso
    Dado que a API recusa a cor por já estar em uso
    Quando eu escolho a cor vermelha e salvo
    Então vejo a mensagem de que a cor já está em uso
    Mas o apelido digitado continua no campo

  Cenário: Cards lado a lado
    Dado que existem 10 pirômetros ativos
    Quando eu abro o Acompanhamento
    Então os cards ficam em grade de 2 colunas, 3 a partir de 1024 px e 4 a partir de 1280 px
    Mas a página não ganha rolagem horizontal

  Cenário: Selecionar um pirômetro na lista
    Dado que existem os pirômetros "PI-12" (ativo) e "PI-15" (inativo)
    E que abro a tela Pirômetros
    Quando eu seleciono "PI-15" na lista
    Então a linha de "PI-15" fica destacada e marcada como selecionada
    E o painel mostra "PI-15" com a situação inativa

  Cenário: Salvar e descartar dependem de haver alteração
    Dado que abro a edição de "PI-12"
    Então Salvar está desabilitado e Descartar alterações não aparece
    Quando eu digito o apelido "Forno 2"
    Então Salvar fica habilitado e Descartar alterações aparece
    E o contador do apelido mostra "7/40"
    Quando eu descarto as alterações
    Então o apelido volta ao valor salvo

  Cenário: Alterações não salvas bloqueiam a troca de pirômetro
    Dado que existem os pirômetros "PI-12" (ativo) e "PI-15" (inativo)
    E que abro a tela Pirômetros
    E que digitei o apelido "Forno 2" sem salvar
    Quando eu seleciono "PI-15" na lista
    Então vejo o aviso "Há alterações não salvas"
    E o painel continua em "PI-12"
    Quando eu descarto as alterações
    Então o painel passa a mostrar "PI-15"

  Cenário: Navegar a lista e a paleta pelo teclado
    Dado que existem os pirômetros "PI-12" (ativo) e "PI-15" (inativo)
    E que abro a tela Pirômetros
    Quando eu aperto a seta para baixo na lista
    Então o painel passa a mostrar "PI-15"
    Quando eu aperto a seta para a direita na paleta
    Então a cor seguinte da paleta fica escolhida

  Cenário: Bateria em porcentagem com barra proporcional
    Dado que "PI-12" tem a última leitura às 10:05 com 1510 graus e bateria 62
    Quando eu abro o Acompanhamento
    Então o card de "PI-12" mostra a bateria "62%" com uma barra de 62% da largura
    Mas a barra não muda de cor nem aparece alerta

  Cenário: Bateria fora de 0 a 100 limita a barra
    Dado que "PI-12" tem a última leitura às 10:05 com 1510 graus e bateria 130
    Quando eu abro o Acompanhamento
    Então o card de "PI-12" mostra a bateria "130%" com uma barra de 100% da largura

  Cenário: Temperatura em display de 7 segmentos
    Dado que "PI-12" tem a última leitura às 10:05 com 1510 graus e bateria 62
    Quando eu abro o Acompanhamento
    Então o card de "PI-12" mostra 1510 em display de 7 segmentos
    E o texto acessível do card diz "1510 °C"
    E os dígitos acesos são vermelhos, em cor fixa de LED
    Mas a cor não depende da cor do pirômetro nem da temperatura

  Cenário: Sem leitura mostra traços no display
    Dado que "PI-14" não tem leitura com temperatura
    Quando eu abro o Acompanhamento
    Então o card de "PI-14" mostra "---" em display de 7 segmentos
    E mostra "Sem leituras com temperatura"

  Cenário: Eixos ajustados aos dados visíveis
    Dado que "PI-12" tem leituras entre 10:00 e 10:14 com temperaturas de 1480 a 1700
    Quando eu vejo o gráfico
    Então o eixo de temperatura vai de 1450 a 1750 e não parte de 0
    E o eixo de horário cobre de 09:55 a 10:19, só a extensão das leituras
    Mas o período "Hoje" continua definindo quais leituras são buscadas

  Cenário: Tema escolhido persiste ao recarregar
    Dado que abri o sistema
    E que alterno para o tema escuro
    Quando eu recarrego a página
    Então o sistema abre no tema escuro
    Mas sem escolha salva o sistema abre no tema claro

  Cenário: Armazenamento indisponível não quebra o tema
    Dado que o navegador não permite guardar a escolha
    Quando eu abro o sistema e alterno para o tema escuro
    Então o tema escuro vale na sessão
    Mas nenhum erro aparece na tela

```

## Ambiguidades

Nenhuma em aberto.

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| Pode criar pirômetro novo? | Não: só se edita o que já existe nos dados | 2026-11-05 |
| Cards de visão geral | Aprovado: um por pirômetro, com última temperatura, bateria, tempo sem leitura | 2026-11-05 |
| Melhorias do gráfico | Aprovado, com cuidado para não quebrar o que existe | 2026-11-05 |
| Intervalo de atualização automática | Manter 5 minutos (spec 001 RF-13): o sincronizador só traz dado novo nesse intervalo | 2026-11-05 |
| Limite de "sem comunicação" | Não existe: a fábrica para fora do expediente; o tempo sem leitura já é a informação útil | 2026-11-05 |
| Intervalo de lacuna do gráfico | ~~15 minutos entre pontos consecutivos~~ **Substituído (emenda 2026-11-05): não há lacuna; a linha sempre liga as leituras e cada leitura tem um ponto** | 2026-11-05 |
| Escolha de cor | Paleta fixa de 12 cores | 2026-11-05 |
| Bateria baixa | Sem destaque; só mostra o valor | 2026-11-05 |
| Ordem dos cards | Por nome mostrado (RF-04), ordem alfabética | 2026-11-05 |
| Nome mostrado | "TAG - APELIDO"; o apelido não substitui a TAG (emenda 2026-11-05) | 2026-11-05 |
| Cards | Grade responsiva de 2 a 4 colunas, mais compactos (emenda 2026-11-05) | 2026-11-05 |
| Cor única | Cor em uso por outro pirômetro fica desabilitada; a API responde 409 se mesmo assim chegar (emenda 2026-11-05) | 2026-11-05 |
| Salvar congela a cor padrão | Aceitável, pois a cor passou a ser única | 2026-11-05 |
| Redesenho da tela Pirômetros | Lista compacta + painel de edição fixo em duas colunas (≥ 1024 px); paleta 6×2; interruptor; contadores; Salvar/Descartar; troca bloqueada com aviso se há alteração; só apresentação e interação mudam (emenda 2026-11-05) | 2026-11-05 |
| Bateria | Presumida em porcentagem (0 a 100), mostrada como "63%" com barra fina neutra, sem alerta; unidade a confirmar (emenda 2026-11-05) | 2026-11-05 |
| Temperatura no card | Display de 7 segmentos em SVG próprio, valor real em texto acessível, traços sem leitura (emenda 2026-11-05) | 2026-11-05 |
| Código do local (`reg_place`) | Fora de escopo agora; feature futura de cadastro/edição de "locais" (emenda 2026-11-05) | 2026-11-05 |
| Display de 7 segmentos: tamanho e cor | Cerca de 33% maior; dígitos acesos em vermelho de LED, apagados em vermelho bem tênue, cor fixa que não indica alerta (emenda 2026-11-05) | 2026-11-05 |
| Gráfico: linha e pontos | Sempre ligar os pontos, sem quebra por intervalo (linha reta na emenda anterior, **substituída em 2026-11-05 por linha monotônica mais grossa e arredondada**, que não inventa extremos), e um ponto pequeno por leitura (substitui a RF-10 de 15 min) | 2026-11-05 |
| Miniatura (sparkline) do card | Removida a pedido do usuário; a consulta extra de série da última hora some junto (emenda 2026-11-05) | 2026-11-05 |
| Eixos do gráfico | Temperatura de mín−margem a máx+margem (5%, mínimo 20 °C, múltiplos de 50 ou 10), nunca de 0; horário da primeira à última leitura com folga de 2% (mínimo 5 min); sem dados, padrão e janela do período; ponto r=3, r=2 acima de 200 pontos (emenda 2026-11-05) | 2026-11-05 |
| Linha do gráfico: suavizada e mais grossa | Traço ≈ 2,5 px, pontas e junções arredondadas, curva monotônica (monotoneX) que não ultrapassa os valores medidos; substitui a linha reta/`linear` (emenda 2026-11-05) | 2026-11-05 |
| Pontos do gráfico e desempenho | Pontos individuais só até 500 pontos visíveis (r=3; r=2 acima de 200); acima disso só a linha suave, com ponto ativo e dica ao passar o mouse; o limite de 2 s do teste de desempenho foi mantido (emenda 2026-11-05) | 2026-11-05 |
| Tema persistente | Escolha salva no `localStorage` e aplicada antes da primeira pintura; sem escolha, claro; armazenamento indisponível não quebra (emenda 2026-11-05) | 2026-11-05 |
| Exportação CSV | Fora de escopo por enquanto | 2026-11-05 |
| E-mail e notificação | Fora de escopo | 2026-11-05 |

## Métricas de sucesso

- Um gestor identifica um pirômetro parado em ≤ 5 segundos após abrir o Acompanhamento.
- Todo pirômetro ativo tem apelido e cor próprios depois de 1 semana de uso.
- Nenhuma chamada a pirômetro inexistente nem criação de pirômetro pela tela.
