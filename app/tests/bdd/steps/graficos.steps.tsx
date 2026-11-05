import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { fireEvent, screen } from '@testing-library/react';
import { isoDay, type PainelWorld } from '../support/painel-world';

const SERIAL: Record<string, string> = { 'PI-12': 'S-12', 'PI-14': 'S-14' };

function today(): string {
  const now = new Date();
  const two = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
}

function addDay(world: PainelWorld, day: string, names: string[]): void {
  for (const name of names) {
    for (const hm of ['08:00', '09:00']) {
      world.api.add({ measuredAt: `${day}T${hm}:00`, serial: SERIAL[name] ?? name, name });
    }
  }
}

/** Uma linha por pirometro: cada `Line` do grafico entra na legenda (o jsdom nao desenha o traco). */
function lineNames(): string[] {
  return [...document.querySelectorAll('.recharts-legend-item-text')].map(
    (e) => e.textContent ?? '',
  );
}

/** O grafico do dia pede de meia-noite a meia-noite. */
function dayWindowCalls(world: PainelWorld): URL[] {
  return world.api
    .callsTo('/api/readings/series')
    .filter((url) => url.searchParams.get('start')?.endsWith('T00:00:00'));
}

function pointsReceived(world: PainelWorld): string[] {
  return world.api.lastSeries.flatMap((s) => s.points.map((p) => p.measured_at));
}

Given(
  /^que hoje é (\d\d\/\d\d\/\d{4}) e existem leituras de "PI-12" e "PI-14" hoje$/,
  function (this: PainelWorld, dmy: string) {
    const day = isoDay(dmy);
    this.setNow(`${day}T15:00:00`);
    addDay(this, day, ['PI-12', 'PI-14']);
    addDay(this, '2026-10-28', ['PI-12', 'PI-14']);
  },
);

Given(
  'que existem leituras de {string} e {string} hoje',
  function (this: PainelWorld, a: string, b: string) {
    addDay(this, today(), [a, b]);
  },
);

When('eu abro o Acompanhamento', function (this: PainelWorld) {
  this.open('/');
});

When(
  'eu escolho o pirômetro {string} no Acompanhamento',
  async function (this: PainelWorld, name: string) {
    this.ensureOpen('/');
    await this.eventually(() => screen.getByRole('option', { name }));
    fireEvent.change(screen.getByLabelText('Pirômetro'), {
      target: { value: SERIAL[name] ?? name },
    });
  },
);

Then(
  'o gráfico mostra uma linha para o {string} e uma para o {string}',
  async function (this: PainelWorld, a: string, b: string) {
    await this.eventually(() => assert.deepEqual(lineNames().sort(), [a, b].sort()));
  },
);

/** O jsdom nao mede layout, entao o traco nao e desenhado: confere que o grafico recebeu cada ponto com o horario da medicao. */
Then('cada ponto está no horário da medição', function (this: PainelWorld) {
  assert.deepEqual(
    pointsReceived(this).filter((p) => p.endsWith('T08:00:00') || p.endsWith('T09:00:00')).length,
    4,
  );
});

Then('não aparece nenhuma leitura de outro dia', function (this: PainelWorld) {
  const day = today();
  const asked = dayWindowCalls(this);
  assert.ok(asked.length > 0);
  for (const url of asked) {
    assert.equal(url.searchParams.get('start'), `${day}T00:00:00`);
    assert.equal(url.searchParams.get('end'), `${day}T23:59:59`);
  }
  assert.equal(pointsReceived(this).length, 4);
});

Then(
  'o gráfico mostra somente a linha do {string}',
  async function (this: PainelWorld, name: string) {
    await this.eventually(() => assert.deepEqual(lineNames(), [name]));
  },
);

Given('que não existem leituras hoje', function () {
  // a API simulada comeca vazia
});

Then('vejo a mensagem {string}', async function (this: PainelWorld, message: string) {
  const expected = message.charAt(0).toUpperCase() + message.slice(1) + '.';
  await this.eventually(() => screen.getByText(expected));
});

Given(
  'que abri o Acompanhamento e o {string} tem leituras até 10:00',
  async function (this: PainelWorld, name: string) {
    this.setNow('2026-10-29T10:00:00');
    for (const hm of ['09:00', '10:00']) {
      this.api.add({ measuredAt: `2026-10-29T${hm}:00`, serial: SERIAL[name] ?? name, name });
    }
    this.open('/');
    await this.eventually(() => assert.equal(pointsReceived(this).length, 2));
    this.memo['pedidos'] = this.api.callsTo('/api/readings/series').length;
  },
);

When(
  'o sincronizador grava uma leitura do {string} às 10:05 e passam 5 minutos',
  async function (this: PainelWorld, name: string) {
    this.api.add({ measuredAt: '2026-10-29T10:05:00', serial: SERIAL[name] ?? name, name });
    this.advance(300_000);
    await this.settle();
  },
);

Then('o gráfico passa a mostrar o ponto das 10:05', async function (this: PainelWorld) {
  await this.eventually(() => assert.ok(pointsReceived(this).includes('2026-10-29T10:05:00')));
  assert.deepEqual(lineNames(), ['PI-12']);
});

Then('não preciso recarregar a página', function (this: PainelWorld) {
  assert.equal(this.renders, 1);
  assert.ok(this.api.callsTo('/api/readings/series').length > Number(this.memo['pedidos']));
});

Given(
  /^que deixei o Acompanhamento aberto em 29\/10\/2026 e não escolhi outro período nas Leituras$/,
  async function (this: PainelWorld) {
    this.setNow('2026-10-29T23:58:00');
    this.api.add({ measuredAt: '2026-10-29T09:00:00', serial: 'S-12', name: 'PI-12' });
    this.api.add({ measuredAt: '2026-10-30T00:02:00', serial: 'S-12', name: 'PI-12' });
    this.open('/');
    await this.eventually(() => assert.equal(lineNames().length, 1));
  },
);

When(/^chega o dia 30\/10\/2026 e passam 5 minutos$/, async function (this: PainelWorld) {
  this.advance(300_000);
  await this.settle();
});

Then(/^o Acompanhamento mostra o dia 30\/10\/2026$/, async function (this: PainelWorld) {
  await this.eventually(() => {
    const last = dayWindowCalls(this).at(-1);
    assert.equal(last?.searchParams.get('start'), '2026-10-30T00:00:00');
    assert.equal(last?.searchParams.get('end'), '2026-10-30T23:59:59');
  });
});
