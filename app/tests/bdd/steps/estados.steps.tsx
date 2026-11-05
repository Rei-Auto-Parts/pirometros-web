import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { fireEvent, screen } from '@testing-library/react';
import type { PainelWorld } from '../support/painel-world';

Given('que a API ainda não respondeu', function (this: PainelWorld) {
  this.api.mode = 'pending';
});

When('eu abro qualquer uma das duas telas', function (this: PainelWorld) {
  this.open('/');
});

When('eu abro qualquer uma das duas telas de leituras', function (this: PainelWorld) {
  this.open('/');
});

Then('vejo a mensagem de que os dados estão indisponíveis', async function (this: PainelWorld) {
  await this.eventually(() => screen.getByText('Os dados estão indisponíveis no momento.'));
});

Then('posso tentar de novo', async function (this: PainelWorld) {
  const before = this.api.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
  await this.eventually(() => assert.ok(this.api.calls.length > before));
});

Then('a tela continua utilizável', async function (this: PainelWorld) {
  fireEvent.click(screen.getByRole('link', { name: 'Leituras' }));
  await this.eventually(() => assert.equal(this.heading(), 'Leituras'));
  await this.eventually(() => screen.getByText('Os dados estão indisponíveis no momento.'));
});

Then('vejo a indicação de que está carregando', async function (this: PainelWorld) {
  await this.eventually(() =>
    assert.match(screen.getByRole('status').textContent ?? '', /Carregando/),
  );
  fireEvent.click(screen.getByRole('link', { name: 'Leituras' }));
  await this.eventually(() => assert.equal(this.heading(), 'Leituras'));
  await this.eventually(() =>
    assert.match(screen.getByRole('status').textContent ?? '', /Carregando/),
  );
});
