# language: pt
Funcionalidade: Saude do sistema

  Cenario: API e banco de dados no ar
    Dado que a API informa API "up" e banco "up"
    Quando eu abro a Saude do sistema
    Entao vejo "API" como "No ar"
    E vejo "Banco de dados" como "No ar"

  Cenario: Banco de dados fora do ar
    Dado que a API informa API "up" e banco "down"
    Quando eu abro a Saude do sistema
    Entao vejo "API" como "No ar"
    E vejo "Banco de dados" como "Fora do ar"

  Cenario: API indisponivel
    Dado que a API esta indisponivel
    Quando eu abro a Saude do sistema
    Entao vejo "API" como "Fora do ar"
    E vejo "Banco de dados" como "Indeterminado"
