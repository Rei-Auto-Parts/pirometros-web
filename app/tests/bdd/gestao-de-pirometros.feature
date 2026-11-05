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

