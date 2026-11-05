# Checklist — Painel de temperaturas / Uso e interface

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] A spec diz como o item da tela atual é destacado no menu
- [ ] A spec diz como o item recolhido é identificado (nome ao passar o mouse), já que só mostra ícone
- [ ] A spec diz o contraste mínimo esperado nos dois temas, ou isso está declarado fora de escopo

## Clareza

- [ ] "Uso em tela de computador" (RNF-05) deixa claro que celular e tablet estão fora do escopo
- [ ] "A tela continua utilizável" com a API fora do ar está descrito (menu, filtros e tema seguem funcionando)
- [ ] A spec deixa claro que o uso é por clique, sem exigência de teclado

## Consistência

- [ ] O tema escuro muda só a aparência, e o cenário "Alternar o tema" confere datas, temperaturas e textos
- [ ] O menu recolhido não esconde nenhuma tela: as três continuam alcançáveis

## Testabilidade

- [ ] Existem cenários para navegar, recolher/expandir e manter o estado ao trocar de tela
- [ ] O critério de "sem rolagem horizontal em 1366 px" pode ser verificado automaticamente ou está marcado como verificação manual
