import { Given, Then, When } from '@cucumber/cucumber';
import { screen, within } from '@testing-library/react';
import type { PainelWorld } from '../support/painel-world';

Given(
  'que a API informa API {string} e banco {string}',
  function (this: PainelWorld, api: string, database: string) {
    this.api.health = { api, database };
  },
);

Given('que a API esta indisponivel', function (this: PainelWorld) {
  this.api.mode = 'down';
});

When('eu abro a Saude do sistema', function (this: PainelWorld) {
  this.open('/saude');
});

Then(
  'vejo {string} como {string}',
  async function (this: PainelWorld, servico: string, estado: string) {
    await this.eventually(() => {
      const row = screen.getByText(servico).closest('li');
      if (!row) throw new Error(`linha de '${servico}' nao encontrada`);
      within(row).getByText(estado);
    });
  },
);
