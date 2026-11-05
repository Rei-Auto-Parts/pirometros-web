# Checklist — Painel de temperaturas / Operação e desempenho

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] RNF-01 (2 s para 10.000 leituras) diz em que máquina e navegador é medido
- [ ] A atualização de 5 minutos (RF-13) diz o que o usuário vê enquanto atualiza (dados anteriores permanecem, sem piscar)
- [ ] Está dito o que acontece se uma atualização falhar com a tela já preenchida (RF-08 vs. RF-13)
- [ ] Está dito o que acontece com resposta da API fora do esperado (erro 4xx/5xx)

## Clareza

- [ ] RNF-03 (endereço da API fora do bundle) é verificável sem ler o código-fonte inteiro
- [ ] A Saúde do sistema mantém a atualização própria atual, e a spec diz isso (RF-12)

## Consistência

- [ ] Nada na spec exige autenticação, login ou perfil (P3)
- [ ] Nada na spec exige rebuild para trocar o endereço da API (P4)
- [ ] A exigência de excluir leitura sem temperatura (RF-14) está atribuída a quem a cumpre: a API ou o front

## Testabilidade

- [ ] O cenário "API indisponível" cobre as telas de leituras e diz que dá para tentar de novo
- [ ] A atualização automática pode ser verificada sem esperar 5 minutos reais
