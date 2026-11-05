# Checklist — Painel de temperaturas / Dados e datas

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] Está dito que a hora mostrada é a hora gravada (`reg_date` sem fuso), sem exceção em nenhuma tela
- [ ] Está dito o formato único de data (`dd/MM/yyyy HH:mm`), sem segundos, também no eixo e no balão do gráfico
- [ ] Está dito que leitura sem temperatura nunca aparece (RF-14)
- [ ] Está dito como aparecem bateria e local ausentes ("—") e pirômetro sem nome (serial)

## Clareza

- [ ] "Temperatura" é número inteiro, e a unidade vem da própria leitura
- [ ] "Bateria" e "Local" são mostrados como gravados, sem tradução nem mapa de códigos
- [ ] A ordem "da mais recente para a mais antiga" é pela data da medição, e não pela data de gravação

## Consistência

- [ ] Os exemplos de data são coerentes com o "hoje" de cada cenário
- [ ] O cenário "Datas aparecem como gravadas" (11:00:30 → 11:00) concorda com RF-09
- [ ] Nada na spec pede conversão de fuso (RNF-02 e P2 concordam)

## Testabilidade

- [ ] A leitura que chegou atrasada tem cenário com horários concretos
- [ ] A paginação tem cenário que garante ausência de repetição entre páginas
- [ ] O período de 2 meses na lista e o limite de um dia no gráfico têm cenário ou critério cada um
- [ ] O fim do período com minuto inteiro (23:59:40 aparece até 23:59) tem cenário
