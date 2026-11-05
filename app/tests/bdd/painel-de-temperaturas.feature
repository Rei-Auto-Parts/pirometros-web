# language: pt
Funcionalidade: Painel de temperaturas (Acompanhamento e Leituras)

  Cenário: Tela inicial é o Acompanhamento
    Dado que abri o sistema
    Então vejo a tela de Acompanhamento
    E o menu lateral tem "Acompanhamento", "Leituras", "Pirômetros" e "Saúde do sistema"

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
