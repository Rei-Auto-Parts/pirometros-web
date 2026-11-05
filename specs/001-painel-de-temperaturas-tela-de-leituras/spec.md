# Especificação — Painel de temperaturas (Acompanhamento, Leituras e Saúde do sistema)

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

## Problema

As leituras dos pirômetros de imersão já estão no banco e a API as entrega, mas os gestores não
têm nenhuma tela para vê-las. Hoje só dá para consultar o banco direto. Sem a tela, a informação
gravada não chega a quem decide.

## Objetivo

Telas simples, só de consulta, que mostram **exatamente o que está gravado** e se mantêm atualizadas com os dados mais recentes:

1. **Acompanhamento**: o gráfico das temperaturas do dia de hoje, por pirômetro.
2. **Leituras**: a lista das leituras de qualquer período, da mais recente para a mais antiga pela
   data da medição, com filtro por pirômetro.
3. **Saúde do sistema**: o estado da API e do banco de dados (a atual página inicial).

## Fora de escopo

- Escolher outro dia ou período no Acompanhamento (ele é sempre o dia de hoje).
- Atualização em tempo real (a atualização é periódica, a cada 5 minutos: RF-13).
- Lembrar o tema e o estado do menu depois de recarregar a página.
- Navegação pelo teclado: o menu e as telas são usados com o mouse (clique).
- Mostrar leituras sem temperatura, ou corrigir/estimar qualquer valor ausente.
- Gráfico de período maior que um dia.
- Números do turno, faixas de temperatura, classificação das leituras, cores por faixa.
- Pontos de medição e mapa de códigos do campo "Local".
- Saúde dos pirômetros (bateria baixa, silêncio, última leitura).
- Correção, estimativa ou sinalização de datas; correção manual de qualquer dado.
- Tela para a TV do laboratório (1920×1080).
- Autenticação, login, perfis.
- Conversão de fuso nas datas.
- Exportação (arquivo, impressão).

## Personas e cenários de uso

- **Gestor**: abre o Acompanhamento para ver como as temperaturas de hoje estão indo.
- **Qualidade**: abre as Leituras, escolhe um período, filtra por um pirômetro e confere o
  horário e a temperatura de cada medição.

Toda consulta de leituras é sempre por período, nunca "tudo".

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | O sistema deve ter as telas Acompanhamento, Leituras e Saúde do sistema, acessíveis por um menu lateral à esquerda. A tela inicial é o Acompanhamento. | obrigatório |
| RF-11 | O menu lateral deve poder ser recolhido e expandido (drill out): recolhido, mostra só o ícone de cada item e libera a largura para o conteúdo; a navegação continua funcionando nos dois estados. O estado (recolhido ou expandido) se mantém ao trocar de tela; ao recarregar a página, o menu volta expandido. | obrigatório |
| RF-12 | A tela Saúde do sistema (a atual página inicial, que mostra o estado da API e do banco) passa a ter rota própria e continua com o mesmo conteúdo e o mesmo comportamento atual (inclusive a atualização própria e o estado "Fora do ar" quando a API não responde). | obrigatório |
| RF-13 | O Acompanhamento e as Leituras devem se atualizar sozinhos a cada 5 minutos (o sincronizador disponibiliza dados novos nesse intervalo), mostrando as leituras mais recentes, sem recarregar a página e sem perder o pirômetro filtrado, o período escolhido e a página em que o usuário está. Enquanto o usuário não escolher outro período, o período das Leituras é "hoje" e acompanha a virada do dia, assim como o Acompanhamento. | obrigatório |
| RF-14 | Leituras sem temperatura não aparecem em lugar nenhum: nem na lista (nem no total e na paginação), nem no gráfico. | obrigatório |
| RF-02 | O Acompanhamento deve mostrar o gráfico das temperaturas do dia de hoje (00:00 às 23:59), com uma linha por pirômetro, todos os pontos, cada um no horário da medição. | obrigatório |
| RF-03 | O Acompanhamento deve permitir filtrar o gráfico por um pirômetro, a partir da lista de pirômetros existentes. | obrigatório |
| RF-04 | As Leituras devem permitir escolher um período (início e fim) de qualquer tamanho e consultá-lo. Ao abrir, o período é o dia de hoje, das 00:00 às 23:59. O fim escolhido inclui o minuto inteiro (até o segundo 59). Se o início for posterior ao fim, a tela avisa e não consulta. | obrigatório |
| RF-05 | As Leituras devem listar as leituras do período, da mais recente para a mais antiga pela data da medição, com paginação. | obrigatório |
| RF-06 | Cada linha da lista deve mostrar a data da medição, o pirômetro (nome; sem nome, o serial), a temperatura (número inteiro), a unidade, a bateria e o local, como gravados. Bateria ou local ausentes aparecem como "—". | obrigatório |
| RF-07 | As Leituras devem permitir filtrar a lista por um pirômetro. | obrigatório |
| RF-08 | As duas telas de leituras devem indicar que estão carregando, informar quando não há leituras e quando a API está indisponível, permitindo tentar de novo. Com a API indisponível, o menu, os filtros e o tema continuam funcionando. | obrigatório |
| RF-09 | Todo texto é em português do Brasil e toda data aparece como `dd/MM/yyyy HH:mm` (os segundos não são mostrados), igual à gravada, sem conversão de fuso. | obrigatório |
| RF-10 | O usuário deve poder alternar entre tema claro e escuro; o sistema abre no tema claro. | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Desempenho percebido | cada tela mostra seu conteúdo em até 2 s após a consulta, para um dia com até 10.000 leituras, com a API respondendo em até 500 ms |
| RNF-02 | Datas sem conversão de fuso | 100% das datas exibidas iguais às devolvidas pela API |
| RNF-03 | Endereço da API | 0 ocorrências do endereço da API no código entregue ao navegador; as telas chamam só o caminho relativo `/api` |
| RNF-04 | Cobertura de testes | ≥ 90% |
| RNF-05 | Uso em tela de computador | sem rolagem horizontal da página em largura de 1366 px |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Painel de temperaturas (Acompanhamento e Leituras)

  Cenário: Tela inicial é o Acompanhamento
    Dado que abri o sistema
    Então vejo a tela de Acompanhamento
    E o menu lateral tem "Acompanhamento", "Leituras" e "Saúde do sistema"

  Cenário: Navegar pelo menu lateral
    Dado que abri o sistema
    Quando eu escolho "Leituras" no menu lateral
    Então vejo a tela de Leituras
    E o item "Leituras" aparece como o item atual do menu

  Cenário: Recolher e expandir o menu lateral
    Dado que abri o sistema com o menu lateral expandido
    Quando eu recolho o menu lateral
    Então o menu mostra só o ícone de cada item
    E posso escolher "Leituras" e vejo a tela de Leituras
    Quando eu expando o menu lateral
    Então o menu volta a mostrar o nome de cada item

  Cenário: O estado do menu se mantém ao trocar de tela
    Dado que recolhi o menu lateral
    Quando eu escolho "Leituras" no menu lateral
    Então vejo a tela de Leituras
    E o menu continua recolhido

  Cenário: Saúde do sistema em rota própria
    Dado que a API informa API "up" e banco "up"
    Quando eu escolho "Saúde do sistema" no menu lateral
    Então vejo "API" como "No ar"
    E vejo "Banco de dados" como "No ar"

  Cenário: Saúde do sistema com a API fora do ar
    Dado que a API não responde
    Quando eu escolho "Saúde do sistema" no menu lateral
    Então vejo "API" como "Fora do ar"
    E vejo "Banco de dados" como "Indeterminado"

  Cenário: Gráfico do dia de hoje com uma linha por pirômetro
    Dado que hoje é 29/10/2026 e existem leituras de "PI-12" e "PI-14" hoje
    Quando eu abro o Acompanhamento
    Então o gráfico mostra uma linha para o "PI-12" e uma para o "PI-14"
    E cada ponto está no horário da medição
    Mas não aparece nenhuma leitura de outro dia

  Cenário: Filtrar o gráfico por pirômetro
    Dado que existem leituras de "PI-12" e "PI-14" hoje
    Quando eu escolho o pirômetro "PI-12" no Acompanhamento
    Então o gráfico mostra somente a linha do "PI-12"

  Cenário: Consultar as leituras de um período
    Dado que existem leituras dos pirômetros "PI-12" e "PI-14" no dia 29/10/2026
    Quando eu abro as Leituras e consulto de 29/10/2026 00:00 a 29/10/2026 23:59
    Então vejo as leituras da mais recente para a mais antiga pela data da medição
    E cada linha mostra data, pirômetro, temperatura, unidade, bateria e local

  Cenário: Período inicial das Leituras é o dia de hoje
    Dado que hoje é 03/11/2026
    Quando eu abro as Leituras
    Então o período escolhido é de 03/11/2026 00:00 a 03/11/2026 23:59

  Cenário: Período longo
    Dado que existem leituras ao longo de 2 meses
    Quando eu consulto um período de 2 meses nas Leituras
    Então vejo as leituras do período, paginadas
    Mas não aparece mensagem de limite de período

  Cenário: Leitura que chegou atrasada fica na ordem da data
    Dado que o "PI-14" mediu às 09:00 e essa leitura foi gravada depois de uma das 14:02
    Quando eu consulto o dia 29/10/2026 nas Leituras
    Então a leitura das 09:00 aparece depois da leitura das 14:02

  Cenário: Datas aparecem como gravadas
    Dado uma leitura gravada em 2026-10-29 11:00:30
    Quando eu consulto o dia 29/10/2026 nas Leituras
    Então a linha mostra "29/10/2026 11:00"
    Mas a hora não é deslocada por fuso

  Cenário: Filtrar as leituras por pirômetro
    Dado que existem leituras de "PI-12" e "PI-14" no período
    Quando eu escolho o pirômetro "PI-12" nas Leituras
    Então a lista mostra somente leituras do "PI-12"

  Cenário: Paginar a lista
    Dado que existem mais leituras no período do que cabem em uma página
    Quando eu vou para a página seguinte
    Então vejo as leituras seguintes, ainda da mais recente para a mais antiga
    Mas nenhuma leitura se repete entre as páginas

  Cenário: Período sem leituras
    Dado que não existem leituras no período escolhido
    Quando eu consulto as Leituras
    Então vejo a mensagem "nenhuma leitura no período"

  Cenário: Acompanhamento sem leituras hoje
    Dado que não existem leituras hoje
    Quando eu abro o Acompanhamento
    Então vejo a mensagem "nenhuma leitura hoje"

  Cenário: API indisponível
    Dado que a API não responde
    Quando eu abro qualquer uma das duas telas
    Então vejo a mensagem de que os dados estão indisponíveis
    E posso tentar de novo
    Mas a tela continua utilizável

  Cenário: Alternar o tema
    Dado que abri o sistema
    Quando eu alterno para o tema escuro
    Então o sistema passa a usar o tema escuro
    Mas as datas, as temperaturas e os textos continuam os mesmos

  Cenário: Texto em português
    Dado que abri o sistema
    Então todos os rótulos, botões e mensagens estão em português do Brasil

  Cenário: Leitura sem temperatura não aparece
    Dado que existe uma leitura do "PI-12" sem temperatura no dia 29/10/2026
    Quando eu consulto o dia 29/10/2026 nas Leituras
    Então a leitura sem temperatura não aparece na lista
    E o total e a paginação não a contam
    E ela não aparece no gráfico do Acompanhamento

  Cenário: Pirômetro sem nome mostra o serial
    Dado que existe uma leitura de um pirômetro sem nome, de serial "ABC123"
    Quando eu consulto o dia da leitura nas Leituras
    Então a linha mostra "ABC123" como pirômetro

  Cenário: Bateria ou local ausentes
    Dado que existe uma leitura sem bateria e sem local
    Quando eu consulto o dia da leitura nas Leituras
    Então a linha mostra "—" na bateria e no local

  Cenário: Início posterior ao fim
    Dado que abri as Leituras
    Quando eu escolho início 30/10/2026 00:00 e fim 29/10/2026 23:59 e consulto
    Então vejo o aviso de que o início deve ser anterior ao fim
    Mas a consulta não é feita

  Cenário: O fim do período inclui o minuto inteiro
    Dado uma leitura gravada em 2026-10-29 23:59:40
    Quando eu consulto de 29/10/2026 00:00 a 29/10/2026 23:59 nas Leituras
    Então a leitura de 23:59 aparece na lista

  Cenário: Carregando
    Dado que a API ainda não respondeu
    Quando eu abro qualquer uma das duas telas de leituras
    Então vejo a indicação de que está carregando

  Cenário: Acompanhamento se atualiza a cada 5 minutos
    Dado que abri o Acompanhamento e o "PI-12" tem leituras até 10:00
    Quando o sincronizador grava uma leitura do "PI-12" às 10:05 e passam 5 minutos
    Então o gráfico passa a mostrar o ponto das 10:05
    Mas não preciso recarregar a página

  Cenário: Leituras se atualizam sem perder filtro, período e página
    Dado que estou nas Leituras de hoje, filtrando o "PI-12", na página 2
    Quando passam 5 minutos e há leituras novas
    Então a lista mostra as leituras mais recentes
    E continuo filtrando o "PI-12", no mesmo período e na página 2

  Cenário: Virada do dia
    Dado que deixei o Acompanhamento aberto em 29/10/2026 e não escolhi outro período nas Leituras
    Quando chega o dia 30/10/2026 e passam 5 minutos
    Então o Acompanhamento mostra o dia 30/10/2026
    E as Leituras mostram o dia 30/10/2026
```

## Ambiguidades

Nenhuma.

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| Período inicial ao abrir a tela | Dia de hoje, 00:00 às 23:59 (sugestão pedida ao assistente; vale para as Leituras) | 2026-11-03 |
| Formatação da temperatura | Número inteiro, como a API devolve | 2026-11-03 |
| Período longo | A lista aceita qualquer período; o gráfico não escolhe período | 2026-11-03 |
| Tema | O usuário pode alternar entre claro e escuro; abre no claro (RF-10) | 2026-11-03 |
| Menu: estado ao trocar de tela | Recolhido ou expandido se mantém ao trocar de tela; volta a expandido ao recarregar (RF-11) | 2026-11-04 |
| Teclado | Fora de escopo: o sistema é usado com clique | 2026-11-04 |
| Leitura sem temperatura | Nunca aparece, nem na lista, nem no total, nem no gráfico (RF-14) | 2026-11-04 |
| Atualização | A cada 5 minutos, igual ao sincronizador; preserva filtro, período e página; "hoje" acompanha a virada do dia (RF-13) | 2026-11-04 |
| Campos ausentes | Pirômetro sem nome mostra o serial; bateria/local ausentes mostram "—"; segundos de data não aparecem. Padrões adotados pelo assistente | 2026-11-04 |
| Período invertido | Início posterior ao fim: aviso e nenhuma consulta. Padrão adotado pelo assistente | 2026-11-04 |
| Saúde do sistema | Mantida: a antiga página inicial vira a tela "Saúde do sistema", em rota própria (RF-12) | 2026-11-04 |
| Menu lateral "drill out" | Entendido como menu recolhível/expansível (RF-11). Interpretação do assistente — confirmar se era outra coisa | 2026-11-04 |
| Divisão em telas | Tela 1 Acompanhamento (gráfico, sempre o dia de hoje) e tela 2 Leituras (lista, qualquer período) | 2026-11-03 |

## Métricas de sucesso

- Um gestor vê como estão as temperaturas de hoje em menos de 10 segundos após abrir o sistema.
- Um gestor consulta as leituras de um dia e confere uma medição em menos de 1 minuto, sem acessar o banco.
- 0 divergências entre a data mostrada na tela e a gravada no banco.
