# Checklist — Painel de temperaturas / Requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-14) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [ ] RF-03 (filtro do gráfico) e RF-07 (filtro da lista) têm cenário próprio cada um
- [ ] RF-04 tem cenário que muda o período e cenário de início posterior ao fim
- [ ] RF-10 (tema) diz que ao recarregar volta ao claro, e isso está também em "Fora de escopo"
- [ ] RF-11 (menu) diz que o estado se mantém ao trocar de tela, e há cenário para isso
- [ ] RF-13 (atualização a cada 5 minutos) tem cenário para o Acompanhamento, para as Leituras e para a virada do dia
- [ ] RF-14 (leitura sem temperatura) tem cenário que cobre lista, total/paginação e gráfico
- [ ] Todo requisito não funcional (RNF-01 a RNF-05) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito (tempo real, persistência de tema/menu, teclado, leitura sem temperatura)

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] "Drill out" (RF-11) está entendido como menu recolhível/expansível, e é isso que o solicitante quer
- [ ] "Dia de hoje" está definido: 00:00 a 23:59, e acompanha a virada do dia (RF-13)
- [ ] O fim do período inclui o minuto inteiro (RF-04)
- [ ] O que se mantém no refresh está dito: pirômetro filtrado, período e página (RF-13)
- [ ] Nenhum requisito admite duas leituras conflitantes
- [ ] Nenhum requisito descreve implementação em vez de comportamento

## Consistência

- [ ] "Problema", "Objetivo", título e RF-01 falam das mesmas três telas
- [ ] "Saúde dos pirômetros" (fora de escopo) não se confunde com "Saúde do sistema" (RF-12)
- [ ] Nenhum requisito contradiz outro (em especial RF-13 e a antiga exclusão de atualização automática, já removida)
- [ ] Nenhum requisito contradiz a constituição (P1 a P7)
- [ ] Vocabulário é o mesmo em todo o documento (pirômetro, leitura, medição, período, tela)

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio: API indisponível (telas de leituras e Saúde do sistema), sem leituras, carregando, período inválido
- [ ] Os RNF-01, RNF-03 e RNF-05 têm forma de verificação indicada (BDD, integração ou medição manual)
