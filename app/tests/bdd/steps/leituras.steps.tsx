import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { fireEvent, screen, within } from '@testing-library/react';
import { isoDay, isoMinute, type PainelWorld } from '../support/painel-world';

const SERIAL: Record<string, string> = { 'PI-12': 'S-12', 'PI-14': 'S-14' };
const DATE = '(\\d\\d/\\d\\d/\\d{4})';
const DATETIME = `${DATE} (\\d\\d:\\d\\d)`;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Linhas de dados da tabela, como lista de celulas de texto. */
function rows(): string[][] {
  const table = screen.queryByRole('table');
  if (!table) return [];
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent ?? ''),
    );
}

function consult(world: PainelWorld, start: string, end: string): void {
  world.ensureOpen('/leituras');
  fireEvent.change(screen.getByLabelText('Início'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('Fim'), { target: { value: end } });
  fireEvent.click(screen.getByRole('button', { name: 'Consultar' }));
}

function consultDay(world: PainelWorld, day: string): void {
  consult(world, `${day}T00:00`, `${day}T23:59`);
}

function addMany(world: PainelWorld, serial: string, day: string, count: number): void {
  for (let i = 0; i < count; i += 1) {
    world.api.add({
      measuredAt: `${day}T${pad(Math.floor(i / 60))}:${pad(i % 60)}:00`,
      serial,
      name: serial === 'S-12' ? 'PI-12' : 'PI-14',
    });
  }
}

Given(
  new RegExp(`^que existem leituras dos pirômetros "PI-12" e "PI-14" no dia ${DATE}$`),
  function (this: PainelWorld, dmy: string) {
    const day = isoDay(dmy);
    this.api.add({ measuredAt: `${day}T09:00:00`, serial: 'S-12', name: 'PI-12' });
    this.api.add({ measuredAt: `${day}T10:30:00`, serial: 'S-14', name: 'PI-14' });
    this.api.add({ measuredAt: `${day}T14:02:00`, serial: 'S-12', name: 'PI-12', place: null });
    this.api.add({ measuredAt: `${day}T15:00:00`, serial: 'S-14', name: 'PI-14', battery: null });
  },
);

When(
  new RegExp(`^eu abro as Leituras e consulto de ${DATETIME} a ${DATETIME}$`),
  function (this: PainelWorld, d1: string, h1: string, d2: string, h2: string) {
    this.open('/leituras');
    consult(this, isoMinute(d1, h1), isoMinute(d2, h2));
  },
);

When(
  new RegExp(`^eu consulto de ${DATETIME} a ${DATETIME} nas Leituras$`),
  function (this: PainelWorld, d1: string, h1: string, d2: string, h2: string) {
    consult(this, isoMinute(d1, h1), isoMinute(d2, h2));
  },
);

When(
  new RegExp(`^eu consulto o dia ${DATE} nas Leituras$`),
  function (this: PainelWorld, dmy: string) {
    consultDay(this, isoDay(dmy));
  },
);

When('eu consulto o dia da leitura nas Leituras', function (this: PainelWorld) {
  const first = this.api.readings[0];
  assert.ok(first, 'nenhuma leitura criada');
  consultDay(this, first.measuredAt.slice(0, 10));
});

When('eu consulto as Leituras', function (this: PainelWorld) {
  this.open('/leituras');
  fireEvent.click(screen.getByRole('button', { name: 'Consultar' }));
});

Then(
  'vejo as leituras da mais recente para a mais antiga pela data da medição',
  async function (this: PainelWorld) {
    await this.eventually(() => assert.ok(rows().length >= 4));
    const dates = rows().map((cells) => cells[0] ?? '');
    const key = (d: string): string =>
      `${d.slice(6, 10)}${d.slice(3, 5)}${d.slice(0, 2)}${d.slice(11)}`;
    assert.deepEqual(
      [...dates].sort((a, b) => key(b).localeCompare(key(a))),
      dates,
    );
  },
);

Then('cada linha mostra data, pirômetro, temperatura, unidade, bateria e local', function () {
  const table = screen.getByRole('table');
  const headers = within(table)
    .getAllByRole('columnheader')
    .map((h) => h.textContent);
  assert.deepEqual(headers, ['Data', 'Pirômetro', 'Temperatura', 'Unidade', 'Bateria', 'Local']);
  for (const cells of rows()) assert.equal(cells.length, 6);
});

Given(new RegExp(`^que hoje é ${DATE}$`), function (this: PainelWorld, dmy: string) {
  this.setNow(`${isoDay(dmy)}T15:00:00`);
});

When('eu abro as Leituras', function (this: PainelWorld) {
  this.open('/leituras');
});

Then(
  new RegExp(`^o período escolhido é de ${DATETIME} a ${DATETIME}$`),
  function (d1: string, h1: string, d2: string, h2: string) {
    assert.equal((screen.getByLabelText('Início') as HTMLInputElement).value, isoMinute(d1, h1));
    assert.equal((screen.getByLabelText('Fim') as HTMLInputElement).value, isoMinute(d2, h2));
  },
);

Given('que existem leituras ao longo de 2 meses', function (this: PainelWorld) {
  for (let i = 0; i < 120; i += 1) {
    const day = new Date(Date.UTC(2026, 8, 1 + Math.floor(i / 2)));
    const iso = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;
    this.api.add({
      measuredAt: `${iso}T${i % 2 === 0 ? '08' : '20'}:00:00`,
      serial: 'S-12',
      name: 'PI-12',
    });
  }
});

When('eu consulto um período de 2 meses nas Leituras', function (this: PainelWorld) {
  this.open('/leituras');
  consult(this, '2026-09-01T00:00', '2026-10-31T23:59');
});

Then('vejo as leituras do período, paginadas', async function (this: PainelWorld) {
  await this.eventually(() => assert.equal(rows().length, 50));
  screen.getByText('Página 1 de 3');
});

Then('não aparece mensagem de limite de período', function () {
  assert.equal(screen.queryByRole('alert'), null);
  assert.ok(!/limite/i.test(document.body.textContent ?? ''));
});

Given(
  'que o {string} mediu às 09:00 e essa leitura foi gravada depois de uma das 14:02',
  function (this: PainelWorld, name: string) {
    this.api.add({ measuredAt: '2026-10-29T14:02:00', serial: 'S-12', name: 'PI-12' });
    this.api.add({ measuredAt: '2026-10-29T09:00:00', serial: SERIAL[name] ?? name, name });
  },
);

Then('a leitura das 09:00 aparece depois da leitura das 14:02', async function (this: PainelWorld) {
  await this.eventually(() => assert.equal(rows().length, 2));
  assert.deepEqual(
    rows().map((cells) => cells[0]),
    ['29/10/2026 14:02', '29/10/2026 09:00'],
  );
});

Given(
  /^(?:uma|que existe uma) leitura gravada em (\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d)$/,
  function (this: PainelWorld, day: string, time: string) {
    this.api.add({ measuredAt: `${day}T${time}`, serial: 'S-12', name: 'PI-12' });
  },
);

Then('a linha mostra {string}', async function (this: PainelWorld, text: string) {
  await this.eventually(() =>
    assert.ok(
      rows().some((cells) => cells.includes(text)),
      `sem ${text}`,
    ),
  );
  this.memo['texto'] = text;
});

Then('a hora não é deslocada por fuso', function () {
  const cells = rows().flat().join(' ');
  assert.ok(cells.includes('11:00'));
  assert.ok(!/ (08|14):00/.test(cells), 'hora deslocada');
});

Then('a leitura de 23:59 aparece na lista', async function (this: PainelWorld) {
  await this.eventually(() => assert.ok(rows().some((cells) => cells[0] === '29/10/2026 23:59')));
});

Given(
  'que existem leituras de {string} e {string} no período',
  function (this: PainelWorld, a: string, b: string) {
    for (const name of [a, b]) {
      for (const hm of ['08:00', '09:00']) {
        this.api.add({ measuredAt: `${today()}T${hm}:00`, serial: SERIAL[name] ?? name, name });
      }
    }
  },
);

When(
  'eu escolho o pirômetro {string} nas Leituras',
  async function (this: PainelWorld, name: string) {
    this.ensureOpen('/leituras');
    await this.eventually(() => screen.getByRole('option', { name }));
    fireEvent.change(screen.getByLabelText('Pirômetro'), {
      target: { value: SERIAL[name] ?? name },
    });
  },
);

Then(
  'a lista mostra somente leituras do {string}',
  async function (this: PainelWorld, name: string) {
    await this.eventually(() => {
      const list = rows();
      assert.ok(list.length > 0);
      for (const cells of list) assert.equal(cells[1], name);
    });
  },
);

Given(
  'que existem mais leituras no período do que cabem em uma página',
  function (this: PainelWorld) {
    addMany(this, 'S-12', today(), 120);
  },
);

When('eu vou para a página seguinte', async function (this: PainelWorld) {
  this.ensureOpen('/leituras');
  await this.eventually(() => assert.equal(rows().length, 50));
  this.memo['pagina1'] = rows().map((cells) => cells[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
});

Then(
  'vejo as leituras seguintes, ainda da mais recente para a mais antiga',
  async function (this: PainelWorld) {
    await this.eventually(() => {
      screen.getByText('Página 2 de 3');
      assert.notEqual(rows()[0]?.[0], (this.memo['pagina1'] as string[])[0]);
    });
    const dates = rows().map((cells) => cells[0] ?? '');
    assert.ok(dates.length > 0);
    assert.deepEqual([...dates].sort().reverse(), dates);
    this.memo['pagina2'] = dates;
  },
);

Then('nenhuma leitura se repete entre as páginas', function (this: PainelWorld) {
  const first = this.memo['pagina1'] as string[];
  const second = this.memo['pagina2'] as string[];
  assert.equal(second.filter((d) => first.includes(d)).length, 0);
});

Given('que não existem leituras no período escolhido', function () {
  // a API simulada comeca vazia
});

Given(
  new RegExp(`^que existe uma leitura do "PI-12" sem temperatura no dia ${DATE}$`),
  function (this: PainelWorld, dmy: string) {
    const day = isoDay(dmy);
    this.setNow(`${day}T15:00:00`);
    addMany(this, 'S-12', day, 50);
    this.api.add({
      measuredAt: `${day}T23:00:00`,
      serial: 'S-12',
      name: 'PI-12',
      temperature: null,
    });
  },
);

Then('a leitura sem temperatura não aparece na lista', async function (this: PainelWorld) {
  await this.eventually(() => assert.equal(rows().length, 50));
  assert.ok(!rows().some((cells) => cells[0] === '29/10/2026 23:00'));
});

Then('o total e a paginação não a contam', function () {
  screen.getByText('Página 1 de 1');
});

Then('ela não aparece no gráfico do Acompanhamento', async function (this: PainelWorld) {
  fireEvent.click(screen.getByRole('link', { name: 'Acompanhamento' }));
  await this.eventually(() =>
    assert.equal(this.api.callsTo('/api/readings/series').length > 0, true),
  );
  await this.eventually(() =>
    assert.deepEqual(
      [...document.querySelectorAll('.recharts-legend-item-text')].map((e) => e.textContent),
      ['PI-12'],
    ),
  );
  const points = this.api.lastSeries.flatMap((s) => s.points);
  assert.equal(points.length, 50);
  assert.ok(points.every((p) => p.temperature !== null));
});

Given(
  'que existe uma leitura de um pirômetro sem nome, de serial {string}',
  function (this: PainelWorld, serial: string) {
    this.api.add({ measuredAt: '2026-10-29T09:00:00', serial, name: null });
  },
);

Then('a linha mostra {string} como pirômetro', async function (this: PainelWorld, serial: string) {
  await this.eventually(() => assert.ok(rows().some((cells) => cells[1] === serial)));
});

Given('que existe uma leitura sem bateria e sem local', function (this: PainelWorld) {
  this.api.add({
    measuredAt: '2026-10-29T09:00:00',
    serial: 'S-12',
    name: 'PI-12',
    battery: null,
    place: null,
  });
});

Then(
  'a linha mostra {string} na bateria e no local',
  async function (this: PainelWorld, empty: string) {
    await this.eventually(() => assert.ok(rows().length === 1));
    const cells = rows()[0] ?? [];
    assert.equal(cells[4], empty);
    assert.equal(cells[5], empty);
  },
);

Given('que abri as Leituras', function (this: PainelWorld) {
  this.open('/leituras');
});

When(
  new RegExp(`^eu escolho início ${DATETIME} e fim ${DATETIME} e consulto$`),
  function (this: PainelWorld, d1: string, h1: string, d2: string, h2: string) {
    this.memo['inicio'] = isoMinute(d1, h1);
    consult(this, isoMinute(d1, h1), isoMinute(d2, h2));
  },
);

Then('vejo o aviso de que o início deve ser anterior ao fim', function () {
  assert.match(screen.getByRole('alert').textContent ?? '', /início deve ser anterior ao fim/i);
});

Then('a consulta não é feita', async function (this: PainelWorld) {
  await this.settle();
  const asked = this.api
    .callsTo('/api/readings')
    .filter((u) => u.searchParams.get('start')?.startsWith(String(this.memo['inicio'])));
  assert.equal(asked.length, 0);
});

Given(
  'que estou nas Leituras de hoje, filtrando o {string}, na página 2',
  async function (this: PainelWorld, name: string) {
    this.setNow('2026-10-29T10:00:00');
    addMany(this, SERIAL[name] ?? name, '2026-10-29', 120);
    this.open('/leituras');
    await this.eventually(() => screen.getByRole('option', { name }));
    fireEvent.change(screen.getByLabelText('Pirômetro'), {
      target: { value: SERIAL[name] ?? name },
    });
    await this.eventually(() =>
      assert.equal(screen.getByText(/Página 1 de/).textContent, 'Página 1 de 3'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await this.eventually(() => screen.getByText('Página 2 de 3'));
    this.memo['linha'] = rows()[0]?.[0];
  },
);

When('passam 5 minutos e há leituras novas', async function (this: PainelWorld) {
  for (let i = 0; i < 10; i += 1) {
    this.api.add({ measuredAt: `2026-10-29T09:${pad(i)}:30`, serial: 'S-12', name: 'PI-12' });
  }
  this.advance(300_000);
  await this.settle();
});

Then('a lista mostra as leituras mais recentes', async function (this: PainelWorld) {
  await this.eventually(() => assert.notEqual(rows()[0]?.[0], this.memo['linha']));
});

Then(
  'continuo filtrando o {string}, no mesmo período e na página 2',
  function (this: PainelWorld, name: string) {
    assert.equal((screen.getByLabelText('Pirômetro') as HTMLSelectElement).value, SERIAL[name]);
    screen.getByText(/Página 2 de/);
    const last = this.api.callsTo('/api/readings').at(-1);
    assert.equal(last?.searchParams.get('dev_id'), SERIAL[name]);
    assert.equal(last?.searchParams.get('page'), '2');
    assert.equal(last?.searchParams.get('start'), '2026-10-29T00:00:00');
  },
);

Then(/^as Leituras mostram o dia 30\/10\/2026$/, async function (this: PainelWorld) {
  fireEvent.click(screen.getByRole('link', { name: 'Leituras' }));
  await this.eventually(() => {
    assert.equal((screen.getByLabelText('Início') as HTMLInputElement).value, '2026-10-30T00:00');
    assert.equal((screen.getByLabelText('Fim') as HTMLInputElement).value, '2026-10-30T23:59');
    assert.deepEqual(
      rows().map((cells) => cells[0]),
      ['30/10/2026 00:02'],
    );
  });
});
