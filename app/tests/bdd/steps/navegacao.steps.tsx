import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { fireEvent, screen, within } from '@testing-library/react';
import { TEXT_KEYS } from '../../../core/domain/constants/text-keys.constants';
import type { PainelWorld } from '../support/painel-world';

function menuLinks(): HTMLElement[] {
  const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
  return within(nav).getAllByRole('link');
}

function chooseInMenu(world: PainelWorld, item: string): void {
  world.ensureOpen('/');
  fireEvent.click(screen.getByRole('link', { name: item }));
}

Given(/^que abri o sistema(?: com o menu lateral expandido)?$/, function (this: PainelWorld) {
  this.open('/');
});

Given('que recolhi o menu lateral', function (this: PainelWorld) {
  this.open('/');
  fireEvent.click(screen.getByRole('button', { name: 'Recolher menu' }));
});

Given('que a API não responde', function (this: PainelWorld) {
  this.api.mode = 'down';
});

When('eu escolho {string} no menu lateral', function (this: PainelWorld, item: string) {
  chooseInMenu(this, item);
});

When('eu recolho o menu lateral', function () {
  fireEvent.click(screen.getByRole('button', { name: 'Recolher menu' }));
});

When('eu expando o menu lateral', function () {
  fireEvent.click(screen.getByRole('button', { name: 'Expandir menu' }));
});

Then('vejo a tela de {word}', async function (this: PainelWorld, tela: string) {
  await this.eventually(() => assert.equal(this.heading(), tela));
});

Then(
  'o menu lateral tem {string}, {string}, {string} e {string}',
  function (a: string, b: string, c: string, d: string) {
    const names = menuLinks().map((link) => link.textContent);
    assert.deepEqual(names, [a, b, c, d]);
  },
);

Then('o item {string} aparece como o item atual do menu', function (item: string) {
  const current = menuLinks().filter((link) => link.getAttribute('aria-current') === 'page');
  assert.deepEqual(
    current.map((link) => link.textContent),
    [item],
  );
});

Then('o menu mostra só o ícone de cada item', function () {
  for (const link of menuLinks()) {
    assert.ok(link.getAttribute('aria-label'), 'o nome do item deve ficar no aria-label');
    assert.ok(link.querySelector('svg'), 'o item deve ter ícone');
    assert.ok(
      link.querySelector('span')?.className.includes('sr-only'),
      'texto visível no menu recolhido',
    );
  }
});

Then(
  'posso escolher {string} e vejo a tela de {word}',
  async function (this: PainelWorld, item: string, tela: string) {
    fireEvent.click(screen.getByRole('link', { name: item }));
    await this.eventually(() => assert.equal(this.heading(), tela));
  },
);

Then('o menu volta a mostrar o nome de cada item', function () {
  for (const link of menuLinks()) {
    assert.equal(link.getAttribute('aria-label'), null);
    assert.ok(!link.querySelector('span')?.className.includes('sr-only'));
  }
});

Then('o menu continua recolhido', function () {
  assert.ok(screen.getByRole('button', { name: 'Expandir menu' }));
});

When('eu alterno para o tema escuro', function (this: PainelWorld) {
  this.memo['antes'] = screen.getByRole('main').textContent;
  fireEvent.click(screen.getByRole('button', { name: 'Tema escuro' }));
});

Then('o sistema passa a usar o tema escuro', function () {
  assert.ok(document.documentElement.classList.contains('dark'));
});

Then('as datas, as temperaturas e os textos continuam os mesmos', function (this: PainelWorld) {
  assert.equal(screen.getByRole('main').textContent, this.memo['antes']);
});

Then('todos os rótulos, botões e mensagens estão em português do Brasil', function () {
  const text = document.body.textContent ?? '';
  for (const key of Object.values(TEXT_KEYS)) {
    assert.ok(!text.includes(key), `chave de texto crua na tela: ${key}`);
  }
  assert.equal(
    document.documentElement.lang === '' || document.documentElement.lang === 'pt-BR',
    true,
  );
  for (const control of [...screen.getAllByRole('link'), ...screen.getAllByRole('button')]) {
    const name = control.getAttribute('aria-label') ?? control.textContent ?? '';
    assert.match(name, /\S/, 'controle sem nome');
  }
  assert.ok(text.includes('Acompanhamento') && text.includes('Saúde do sistema'));
});
