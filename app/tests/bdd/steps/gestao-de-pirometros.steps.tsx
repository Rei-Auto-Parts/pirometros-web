import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { fireEvent, screen, within } from '@testing-library/react';
import { PYROMETER_PALETTE } from '../../../core/domain/constants/pyrometer-profile.constants';
import { toEpochSeconds } from '../../../core/domain/models/reg-date.model';
import { toChartPoints } from '../../../core/domain/models/series-points.model';
import type { PainelWorld } from '../support/painel-world';

const SERIAL: Record<string, string> = { 'PI-12': 'S-12', 'PI-14': 'S-14', 'PI-15': 'S-15' };
const DAY = '2026-11-05';
const CARDS = 'Visão geral dos pirômetros';
const RED = '#dc2626';

function serialOf(name: string): string {
  return SERIAL[name] ?? name;
}

/** Fixa "agora" uma vez por cenario; um passo "agora sao ..." sobrepoe. */
function ensureNow(world: PainelWorld): void {
  if (world.memo['now'] === undefined) {
    world.memo['now'] = '2026-11-05T12:00:00';
    world.setNow(String(world.memo['now']));
  }
}

function seed(
  world: PainelWorld,
  name: string,
  clock: string,
  temperature: number | null = 1500,
  battery = 80,
): void {
  ensureNow(world);
  world.api.add({
    measuredAt: `${DAY}T${clock}:00`,
    serial: serialOf(name),
    name,
    temperature,
    battery,
  });
}

function seedDay(world: PainelWorld, names: string[]): void {
  for (const name of names) {
    seed(world, name, '08:00');
    seed(world, name, '09:00');
  }
}

function cardsRegion(): HTMLElement {
  return screen.getByRole('region', { name: CARDS });
}

function cardOf(name: string): HTMLElement {
  const found = within(cardsRegion())
    .getAllByRole('button')
    .find((button) => (button.textContent ?? '').includes(name));
  assert.ok(found, `card de ${name} nao encontrado`);
  return found;
}

function legendNames(): string[] {
  return [...document.querySelectorAll('.recharts-legend-item-text')].map(
    (item) => item.textContent ?? '',
  );
}

function formOf(name: string): HTMLElement {
  return screen.getByRole('form', { name });
}

function rowsOf(): HTMLElement[] {
  return screen.queryAllByRole('option');
}

function rowOf(name: string): HTMLElement {
  const found = rowsOf().find((row) => (row.textContent ?? '').includes(name));
  assert.ok(found, `linha de ${name} nao encontrada`);
  return found;
}

async function selectRow(world: PainelWorld, name: string): Promise<void> {
  await world.eventually(() => rowOf(name));
  fireEvent.click(rowOf(name));
  await world.settle();
}

function goTo(link: string): void {
  fireEvent.click(screen.getByRole('link', { name: link }));
}

function chartCalls(world: PainelWorld): URL[] {
  return world.api.callsTo('/api/readings/series');
}

// ---- Dado

Given(
  /^que existem os pirômetros "([^"]+)" \(ativo\) e "([^"]+)" \(inativo\)$/,
  function (this: PainelWorld, active: string, inactive: string) {
    seedDay(this, [active, inactive]);
    this.api.profiles.set(serialOf(active), {
      nickname: null,
      color: null,
      note: 'termopar trocado',
      active: true,
    });
    this.api.profiles.set(serialOf(inactive), {
      nickname: null,
      color: null,
      note: null,
      active: false,
    });
  },
);

Given('que {string} não tem apelido', function (this: PainelWorld, name: string) {
  seedDay(this, [name]);
});

Given(
  'que salvei o apelido {string} para {string}',
  function (this: PainelWorld, nickname: string, name: string) {
    seedDay(this, [name]);
    this.api.profiles.set(serialOf(name), { nickname, color: null, note: null, active: true });
  },
);

Given('que a API recusa o apelido por ser grande demais', function (this: PainelWorld) {
  seedDay(this, ['PI-12']);
  this.api.rejectSaves = true;
});

Given('que {string} está ativo', function (this: PainelWorld, name: string) {
  seedDay(this, ['PI-12', name]);
});

Given(
  'que {string} tem a última leitura às {word} com {int} graus e bateria {int}',
  function (this: PainelWorld, name: string, clock: string, temperature: number, battery: number) {
    seed(this, name, '10:00', temperature - 10, battery);
    seed(this, name, clock, temperature, battery);
  },
);

Given('que agora são {word}', function (this: PainelWorld, clock: string) {
  this.memo['now'] = `${DAY}T${clock}:00`;
  this.setNow(String(this.memo['now']));
});

Given(
  'que {string} está sem leitura há {int} horas',
  function (this: PainelWorld, name: string, hours: number) {
    this.memo['now'] = `${DAY}T${String(10 + hours).padStart(2, '0')}:05:00`;
    this.setNow(String(this.memo['now']));
    seed(this, name, '10:05');
    seed(this, 'PI-12', `${String(9 + hours).padStart(2, '0')}:59`);
  },
);

Given('que abro a edição de {string}', function (this: PainelWorld, name: string) {
  seedDay(this, [name]);
  this.open('/pirometros');
});

Given(
  'que o gráfico mostra {string} e {string}',
  async function (this: PainelWorld, a: string, b: string) {
    seedDay(this, [a, b]);
    this.open('/');
    await this.eventually(() => assert.deepEqual(legendNames().sort(), [a, b].sort()));
  },
);

Given('que o gráfico mostra o período {string}', async function (this: PainelWorld, label: string) {
  seedDay(this, ['PI-12', 'PI-14']);
  this.open('/');
  await this.eventually(() => screen.getByRole('button', { name: label, pressed: true }));
});

Given('que filtrei o pirômetro {string}', async function (this: PainelWorld, name: string) {
  await this.eventually(() => screen.getByRole('option', { name }));
  fireEvent.change(screen.getByLabelText('Pirômetro'), { target: { value: serialOf(name) } });
  await this.eventually(() => assert.deepEqual(legendNames(), [name]));
});

Given(
  'que {string} tem leituras às {word} e às {word} e nenhuma entre elas',
  function (this: PainelWorld, name: string, first: string, second: string) {
    seed(this, name, first);
    seed(this, name, second);
  },
);

Given('que {string} tem a cor vermelha escolhida', function (this: PainelWorld, name: string) {
  seedDay(this, [name]);
  this.api.profiles.set(serialOf(name), { nickname: null, color: RED, note: null, active: true });
});

// ---- Quando

When('eu abro o painel', function (this: PainelWorld) {
  this.open('/');
});

When('eu abro a tela Pirômetros', function (this: PainelWorld) {
  this.open('/pirometros');
});

When(
  'eu informo o apelido {string}, escolho uma cor, escrevo uma observação e salvo',
  async function (this: PainelWorld, nickname: string) {
    this.ensureOpen('/pirometros');
    await this.eventually(() => formOf('PI-12'));
    const form = within(formOf('PI-12'));
    fireEvent.change(form.getByLabelText('Apelido'), { target: { value: nickname } });
    fireEvent.click(form.getByRole('radio', { name: 'Vermelho' }));
    fireEvent.change(form.getByLabelText('Observação'), { target: { value: 'termopar trocado' } });
    fireEvent.click(form.getByRole('button', { name: 'Salvar' }));
    await this.eventually(() => assert.ok(this.api.lastSaved !== null));
  },
);

When('eu salvo', async function (this: PainelWorld) {
  this.ensureOpen('/pirometros');
  await this.eventually(() => formOf('PI-12'));
  const form = within(formOf('PI-12'));
  this.memo['digitado'] = 'Apelido grande demais';
  fireEvent.change(form.getByLabelText('Apelido'), { target: { value: this.memo['digitado'] } });
  fireEvent.click(form.getByRole('button', { name: 'Salvar' }));
});

When(
  'eu seleciono {string} na lista, o marco como inativo e salvo',
  async function (this: PainelWorld, name: string) {
    this.open('/pirometros');
    await selectRow(this, name);
    const form = within(formOf(name));
    fireEvent.click(form.getByRole('switch', { name: 'Ativo' }));
    fireEvent.click(form.getByRole('button', { name: 'Salvar' }));
    await this.eventually(() => assert.equal(this.api.lastSaved?.body.active, false));
  },
);

When('eu clico no card de {string}', async function (this: PainelWorld, name: string) {
  await this.eventually(() => cardOf(name));
  this.memo['card'] = name;
  fireEvent.click(cardOf(name));
});

When('eu clico de novo no mesmo card', async function (this: PainelWorld) {
  fireEvent.click(cardOf(String(this.memo['card'])));
  await this.settle();
});

When('eu escolho {string}', async function (this: PainelWorld, label: string) {
  fireEvent.click(screen.getByRole('button', { name: label }));
  await this.settle();
});

When('eu vejo o gráfico', function (this: PainelWorld) {
  this.open('/');
});

// ---- Então

Then(
  /^o menu lateral mostra (.+), (.+), (.+) e (.+)$/,
  function (this: PainelWorld, a: string, b: string, c: string, d: string) {
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    const names = within(nav)
      .getAllByRole('link')
      .map((link) => link.textContent);
    assert.deepEqual(names, [a, b, c, d]);
  },
);

Then(
  'vejo os dois na lista, cada um com nome, serial, cor, situação e observação',
  async function (this: PainelWorld) {
    await this.eventually(() => assert.equal(rowsOf().length, 2));
    for (const [name, badge] of [
      ['PI-12', 'Ativo'],
      ['PI-15', 'Inativo'],
    ] as const) {
      const row = rowOf(name);
      const text = row.textContent ?? '';
      assert.ok(text.includes(serialOf(name)), text);
      assert.ok(text.includes(badge), text);
      assert.ok(row.querySelector('[aria-hidden="true"]'), 'bolinha da cor');
    }
    assert.ok((rowOf('PI-12').textContent ?? '').includes('termopar trocado'));
  },
);

Then(
  'o primeiro da lista vem selecionado, com o painel de edição aberto',
  async function (this: PainelWorld) {
    assert.equal(rowsOf()[0]?.getAttribute('aria-selected'), 'true');
    await this.eventually(() => formOf('PI-12'));
    assert.equal(screen.getAllByRole('form').length, 1);
  },
);

Then('o pirômetro inativo aparece atenuado', function () {
  assert.ok(rowOf('PI-15').className.includes('opacity-60'));
});

Then('vejo a confirmação de que foi salvo', async function (this: PainelWorld) {
  await this.eventually(() =>
    assert.match(screen.getByRole('status').textContent ?? '', /Salvo\./),
  );
});

Then(
  'a tela mostra {string} para esse pirômetro',
  async function (this: PainelWorld, shown: string) {
    await this.eventually(() => formOf(shown));
    assert.equal(this.api.lastSaved?.body.nickname, shown.split(' - ').slice(1).join(' - '));
    assert.equal(this.api.lastSaved?.body.color, RED);
  },
);

Then(
  'o card, a linha do gráfico e o filtro mostram {string}',
  async function (this: PainelWorld, nickname: string) {
    await this.eventually(() => assert.ok(cardOf(nickname)));
    await this.eventually(() => assert.ok(legendNames().includes(nickname)));
    await this.eventually(() => screen.getByRole('option', { name: nickname }));
  },
);

Then(
  'as Leituras mostram {string} na coluna de pirômetro',
  async function (this: PainelWorld, nickname: string) {
    goTo('Leituras');
    await this.eventually(() =>
      assert.ok(screen.getAllByRole('cell', { name: nickname }).length > 0),
    );
  },
);

Then('o nome mostrado é {string}', async function (this: PainelWorld, name: string) {
  this.ensureOpen('/');
  await this.eventually(() => assert.ok(cardOf(name)));
  await this.eventually(() => assert.ok(legendNames().includes(name)));
});

Then('vejo a mensagem do erro', async function () {
  await new Promise<void>((resolve) => setImmediate(resolve));
  const alert = await screen.findByRole('alert');
  assert.match(alert.textContent ?? '', /Não foi possível salvar: confira os campos\./);
});

Then('o apelido digitado continua no campo', function (this: PainelWorld) {
  const field = within(formOf('PI-12')).getByLabelText('Apelido') as HTMLInputElement;
  assert.equal(field.value, this.memo['digitado']);
});

Then(
  'ele some dos cards, do gráfico e do filtro do Acompanhamento',
  async function (this: PainelWorld) {
    goTo('Acompanhamento');
    await this.eventually(() => {
      assert.ok(cardOf('PI-12'));
      assert.deepEqual(legendNames(), ['PI-12']);
      assert.equal(screen.queryAllByRole('option', { name: /PI-15/ }).length, 0);
      assert.equal(
        within(cardsRegion())
          .getAllByRole('button')
          .filter((button) => (button.textContent ?? '').includes('PI-15')).length,
        0,
      );
    });
  },
);

Then('continua na tela Pirômetros e no filtro das Leituras', async function (this: PainelWorld) {
  goTo('Pirômetros');
  await this.eventually(() => assert.ok(rowOf('PI-15').textContent?.includes('Inativo')));
  goTo('Leituras');
  await this.eventually(() => screen.getByRole('option', { name: 'PI-15 (inativo)' }));
});

Then('não existe ação para criar nem excluir pirômetro', async function (this: PainelWorld) {
  await this.eventually(() => assert.ok(screen.queryByText('Carregando…') === null));
  const names = screen.getAllByRole('button').map((button) => button.textContent ?? '');
  assert.equal(names.filter((text) => /criar|novo|adicionar|excluir|apagar/i.test(text)).length, 0);
});

Then(
  'o card de {string} mostra {int}, a data {word}, bateria {int}% e {string}',
  async function (
    this: PainelWorld,
    name: string,
    temperature: number,
    clock: string,
    battery: number,
    without: string,
  ) {
    await this.eventually(() => {
      const text = cardOf(name).textContent ?? '';
      assert.ok(text.includes(`${temperature} °C`), text);
      assert.ok(text.includes(`05/11/2026 ${clock}`), text);
      assert.ok(text.includes(`Bateria ${battery}%`), text);
      assert.ok(text.includes(without), text);
    });
  },
);

Then('o card não tem miniatura de temperaturas', async function (this: PainelWorld) {
  await this.eventually(() => assert.ok(cardOf('PI-12')));
  assert.equal(within(cardOf('PI-12')).queryAllByRole('img').length, 0);
  assert.equal(cardOf('PI-12').querySelectorAll('.recharts-wrapper').length, 0);
  assert.equal(cardOf('PI-12').querySelectorAll('svg').length, 1);
  const extra = this.api
    .callsTo('/api/readings/series')
    .filter((url) => url.searchParams.get('dev_id') === null);
  assert.ok(extra.every((url) => (url.searchParams.get('start') ?? '').endsWith('T00:00:00')));
});

Then(
  'o card de {string} mostra {string}',
  async function (this: PainelWorld, name: string, text: string) {
    await this.eventually(() => assert.ok((cardOf(name).textContent ?? '').includes(text)));
  },
);

Then('o card não recebe destaque nem alerta', function () {
  const cards = within(cardsRegion()).getAllByRole('button');
  const classes = new Set(cards.map((card) => card.className));
  assert.equal(classes.size, 1, 'todos os cards tem a mesma aparencia');
  assert.equal(within(cardsRegion()).queryAllByRole('alert').length, 0);
});

Then(
  'a cor é escolhida entre as 12 cores da paleta fixa, em grade de 6 por linha',
  async function (this: PainelWorld) {
    await this.eventually(() => formOf('PI-12'));
    const radios = within(formOf('PI-12')).getAllByRole('radio');
    assert.equal(radios.length, 12);
    assert.deepEqual(
      radios.map((radio) => (radio as HTMLElement).style.backgroundColor),
      PYROMETER_PALETTE.map((color) => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = color.value;
        return probe.style.backgroundColor;
      }),
    );
    assert.ok(within(formOf('PI-12')).getByRole('radiogroup').className.includes('grid-cols-6'));
  },
);

Then('não há seletor livre de cor', function () {
  assert.equal(document.querySelectorAll('input[type="color"]').length, 0);
});

Then(
  'o gráfico mostra só {string} e o filtro mostra {string}',
  async function (this: PainelWorld, name: string, filter: string) {
    await this.eventually(() => assert.deepEqual(legendNames(), [name]));
    assert.equal((screen.getByLabelText('Pirômetro') as HTMLSelectElement).value, serialOf(filter));
  },
);

Then('o gráfico volta a mostrar os dois', async function (this: PainelWorld) {
  await this.eventually(() => assert.deepEqual(legendNames().sort(), ['PI-12', 'PI-14']));
  assert.equal((screen.getByLabelText('Pirômetro') as HTMLSelectElement).value, '');
});

Then('o gráfico mostra só as seis últimas horas', async function (this: PainelWorld) {
  await this.eventually(() => {
    const last = chartCalls(this).at(-1);
    const span =
      toEpochSeconds(last?.searchParams.get('end') ?? '') -
      toEpochSeconds(last?.searchParams.get('start') ?? '');
    assert.equal(span, 6 * 3600);
  });
});

Then('o pirômetro filtrado continua o mesmo', function (this: PainelWorld) {
  assert.equal(chartCalls(this).at(-1)?.searchParams.get('dev_id'), serialOf('PI-12'));
  assert.equal((screen.getByLabelText('Pirômetro') as HTMLSelectElement).value, serialOf('PI-12'));
});

/**
 * O jsdom nao desenha o traco no grafico responsivo: confere que o grafico recebeu as duas
 * leituras e que o mapeamento mantem as duas, sem ponto vazio entre elas (o desenho da reta e dos
 * pontos e provado no teste unitario do grafico).
 */
function receivedPoints(world: PainelWorld, name: string) {
  const received = world.api.lastSeries.find((series) => series.pyrometer_id === serialOf(name));
  return (received?.points ?? []).map((point) => ({
    measuredAt: point.measured_at,
    temperature: Number(point.temperature),
  }));
}

Then(
  /^a linha de "([^"]+)" liga a leitura das (\S+) à das (\S+) sem interrupção$/,
  async function (this: PainelWorld, name: string, first: string, second: string) {
    await this.eventually(() => assert.deepEqual(legendNames(), [name]));
    const points = receivedPoints(this, name);
    assert.deepEqual(
      points.map((point) => point.measuredAt),
      [`${DAY}T${first}:00`, `${DAY}T${second}:00`],
    );
    const chartPoints = toChartPoints(points);
    assert.equal(chartPoints.length, 2);
    assert.ok(chartPoints.every((point) => Number.isFinite(point.temperature)));
    for (const curve of document.querySelectorAll('.recharts-line-curve')) {
      assert.equal(
        (curve.getAttribute('d') ?? '').split('M').length - 1 <= 1,
        true,
        'linha quebrada',
      );
    }
  },
);

/** O jsdom nao desenha os pontos no grafico responsivo: confere as duas leituras no mapeamento (o desenho, no teste unitario). */
Then('cada uma das duas leituras aparece como um ponto', function (this: PainelWorld) {
  assert.deepEqual(
    toChartPoints(receivedPoints(this, 'PI-12')).map((point) => point.temperature),
    [1500, 1500],
  );
});

Then(
  'o card e a linha de {string} usam o vermelho',
  async function (this: PainelWorld, name: string) {
    await this.eventually(() => {
      const dot = cardOf(name).querySelector('[aria-hidden="true"]') as HTMLElement | null;
      assert.equal(dot?.style.backgroundColor, 'rgb(220, 38, 38)');
      assert.ok(
        document.querySelector(
          `.recharts-legend-item [stroke="${RED}"], .recharts-legend-item [fill="${RED}"]`,
        ),
        'a legenda do grafico deve usar a cor',
      );
    });
  },
);

Then(
  'o nome {string} está escrito no card e na legenda do gráfico',
  function (this: PainelWorld, name: string) {
    assert.ok((cardOf(name).textContent ?? '').includes(name));
    assert.ok(legendNames().includes(name));
  },
);

Then('vejo a mensagem de erro com a opção de tentar de novo', async function (this: PainelWorld) {
  await this.eventually(() => screen.getByText('Os dados estão indisponíveis no momento.'));
  assert.ok(screen.getByRole('button', { name: 'Tentar de novo' }));
});

Then('o menu e o tema continuam funcionando', async function (this: PainelWorld) {
  fireEvent.click(screen.getByRole('button', { name: 'Recolher menu' }));
  assert.ok(screen.getByRole('button', { name: 'Expandir menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Tema escuro' }));
  assert.ok(document.documentElement.classList.contains('dark'));
  fireEvent.click(screen.getByRole('link', { name: 'Leituras' }));
  await this.eventually(() => assert.equal(this.heading(), 'Leituras'));
});

// ---- Emendas de 2026-11-05: cor unica e grade dos cards

Given('que {string} usa a cor vermelha', function (this: PainelWorld, name: string) {
  seedDay(this, [name]);
  this.api.profiles.set(serialOf(name), { nickname: null, color: RED, note: null, active: true });
});

Then(
  'a cor vermelha aparece desabilitada com a indicação {string}',
  async function (this: PainelWorld, hint: string) {
    await this.eventually(() => formOf('PI-12'));
    const radio = within(formOf('PI-12')).getByRole('radio', { name: `Vermelho (${hint})` });
    assert.equal((radio as HTMLButtonElement).disabled, true);
    assert.equal(radio.getAttribute('title'), `Vermelho (${hint})`);
  },
);

Then('a cor atual de {string} continua selecionável', function (this: PainelWorld, name: string) {
  const own = within(formOf(name)).getByRole('radio', { name: 'Azul', checked: true });
  assert.equal((own as HTMLButtonElement).disabled, false);
});

Given('que a API recusa a cor por já estar em uso', function (this: PainelWorld) {
  seedDay(this, ['PI-12']);
  this.api.rejectColorInUse = true;
});

When('eu escolho a cor vermelha e salvo', async function (this: PainelWorld) {
  this.ensureOpen('/pirometros');
  await this.eventually(() => formOf('PI-12'));
  const form = within(formOf('PI-12'));
  this.memo['digitado'] = 'Forno com cor repetida';
  fireEvent.change(form.getByLabelText('Apelido'), { target: { value: this.memo['digitado'] } });
  fireEvent.click(form.getByRole('radio', { name: 'Vermelho' }));
  fireEvent.click(form.getByRole('button', { name: 'Salvar' }));
});

Then('vejo a mensagem de que a cor já está em uso', async function () {
  const alert = await screen.findByRole('alert');
  assert.match(
    alert.textContent ?? '',
    /Essa cor já está em uso por outro pirômetro\. Escolha outra cor\./,
  );
});

Given('que existem {int} pirômetros ativos', function (this: PainelWorld, count: number) {
  const names = Array.from(
    { length: count },
    (_, index) => `PI-${String(index + 1).padStart(2, '0')}`,
  );
  seedDay(this, names);
  this.memo['quantidade'] = count;
});

Then(
  'os cards ficam em grade de 2 colunas, 3 a partir de 1024 px e 4 a partir de 1280 px',
  async function (this: PainelWorld) {
    await this.eventually(() =>
      assert.equal(within(cardsRegion()).getAllByRole('button').length, this.memo['quantidade']),
    );
    const grid = cardsRegion().querySelector('ul');
    assert.ok(grid?.className.includes('grid-cols-2'));
    assert.ok(grid?.className.includes('lg:grid-cols-3'));
    assert.ok(grid?.className.includes('xl:grid-cols-4'));
  },
);

/** O jsdom nao mede layout: confere que a grade e fluida e nao declara rolagem horizontal. */
Then('a página não ganha rolagem horizontal', function () {
  const grid = cardsRegion().querySelector('ul');
  assert.ok(!(grid?.className ?? '').includes('overflow-x'));
  assert.ok(!(document.querySelector('main')?.className ?? '').includes('overflow-x'));
});

// ---- Emenda de 2026-11-05: redesenho da tela Pirômetros

Given('que abro a tela Pirômetros', function (this: PainelWorld) {
  this.open('/pirometros');
});

Given(
  'que digitei o apelido {string} sem salvar',
  async function (this: PainelWorld, nickname: string) {
    await this.eventually(() => formOf('PI-12'));
    fireEvent.change(within(formOf('PI-12')).getByLabelText('Apelido'), {
      target: { value: nickname },
    });
  },
);

When('eu seleciono {string} na lista', async function (this: PainelWorld, name: string) {
  await selectRow(this, name);
});

Then(
  'a linha de {string} fica destacada e marcada como selecionada',
  async function (this: PainelWorld, name: string) {
    await this.eventually(() => {
      const row = rowOf(name);
      assert.equal(row.getAttribute('aria-selected'), 'true');
      assert.equal(row.getAttribute('aria-current'), 'true');
      assert.ok(row.className.includes('bg-secondary'));
      assert.ok(row.style.borderLeftColor !== '');
    });
  },
);

Then(
  'o painel mostra {string} com a situação inativa',
  async function (this: PainelWorld, name: string) {
    await this.eventually(() => formOf(name));
    assert.equal(
      (within(formOf(name)).getByRole('switch', { name: 'Ativo' }) as HTMLInputElement).checked,
      false,
    );
  },
);

Then(
  'Salvar está desabilitado e Descartar alterações não aparece',
  async function (this: PainelWorld) {
    await this.eventually(() => formOf('PI-12'));
    const form = within(formOf('PI-12'));
    assert.equal(
      (form.getByRole('button', { name: 'Salvar' }) as HTMLButtonElement).disabled,
      true,
    );
    assert.equal(form.queryByRole('button', { name: 'Descartar alterações' }), null);
  },
);

When('eu digito o apelido {string}', function (this: PainelWorld, nickname: string) {
  fireEvent.change(within(formOf('PI-12')).getByLabelText('Apelido'), {
    target: { value: nickname },
  });
});

Then('Salvar fica habilitado e Descartar alterações aparece', function () {
  const form = within(formOf('PI-12'));
  assert.equal((form.getByRole('button', { name: 'Salvar' }) as HTMLButtonElement).disabled, false);
  assert.ok(form.getByRole('button', { name: 'Descartar alterações' }));
});

Then('o contador do apelido mostra {string}', function (counter: string) {
  assert.ok(within(formOf('PI-12')).getByText(counter));
});

When('eu descarto as alterações', async function (this: PainelWorld) {
  fireEvent.click(screen.getByRole('button', { name: 'Descartar alterações' }));
  await this.settle();
});

Then('o apelido volta ao valor salvo', function () {
  assert.equal((within(formOf('PI-12')).getByLabelText('Apelido') as HTMLInputElement).value, '');
});

Then('vejo o aviso {string}', async function (this: PainelWorld, warning: string) {
  await this.eventually(() =>
    assert.match(screen.getByRole('alert').textContent ?? '', new RegExp(warning)),
  );
});

Then('o painel continua em {string}', function (name: string) {
  assert.ok(formOf(name));
  assert.equal(screen.queryAllByRole('form').length, 1);
});

Then('o painel passa a mostrar {string}', async function (this: PainelWorld, name: string) {
  await this.eventually(() => formOf(name));
});

When('eu aperto a seta para baixo na lista', async function (this: PainelWorld) {
  await this.eventually(() => assert.ok(rowsOf().length > 0));
  const current = rowsOf().find((row) => row.getAttribute('aria-selected') === 'true');
  assert.ok(current);
  fireEvent.keyDown(current, { key: 'ArrowDown' });
  await this.settle();
});

When('eu aperto a seta para a direita na paleta', async function (this: PainelWorld) {
  const radios = screen.getAllByRole('radio') as HTMLButtonElement[];
  const from = radios.findIndex((radio) => radio.getAttribute('aria-checked') === 'true');
  let next = from;
  do {
    next = (next + 1) % radios.length;
  } while (radios[next]?.disabled);
  this.memo['esperada'] = radios[next]?.getAttribute('aria-label');
  fireEvent.keyDown(radios[from] as HTMLElement, { key: 'ArrowRight' });
  await this.settle();
});

Then('a cor seguinte da paleta fica escolhida', function (this: PainelWorld) {
  const checked = screen
    .getAllByRole('radio')
    .filter((radio) => radio.getAttribute('aria-checked') === 'true');
  assert.equal(checked.length, 1);
  assert.equal(checked[0]?.getAttribute('aria-label'), this.memo['esperada']);
});

// ---- Emenda de 2026-11-05: bateria em %, display de 7 segmentos

function chars(card: HTMLElement): string[] {
  return [...card.querySelectorAll('[data-char]')].map(
    (cell) => cell.getAttribute('data-char') ?? '',
  );
}

Given('que {string} não tem leitura com temperatura', function (this: PainelWorld, name: string) {
  seed(this, name, '10:00', null);
});

Then(
  'o card de {string} mostra a bateria {string} com uma barra de {int}% da largura',
  async function (this: PainelWorld, name: string, shown: string, width: number) {
    this.memo['card'] = name;
    await this.eventually(() =>
      assert.ok((cardOf(name).textContent ?? '').includes(`Bateria ${shown}`)),
    );
    const bar = cardOf(name).querySelector('[data-battery-bar]') as HTMLElement | null;
    assert.equal(bar?.style.width, `${width}%`);
  },
);

Then('a barra não muda de cor nem aparece alerta', function (this: PainelWorld) {
  const card = cardOf(String(this.memo['card']));
  const bar = card.querySelector('[data-battery-bar]');
  assert.ok(bar?.className.includes('bg-primary'));
  assert.ok(!/red|amber|destructive/.test(bar?.className ?? ''));
  assert.equal(card.querySelectorAll('[role="alert"]').length, 0);
});

Then(
  'o card de {string} mostra {int} em display de 7 segmentos',
  async function (this: PainelWorld, name: string, value: number) {
    this.memo['card'] = name;
    await this.eventually(() =>
      assert.deepEqual(chars(cardOf(name)), [...String(value).padStart(4, ' ')]),
    );
    assert.ok(cardOf(name).querySelectorAll('[data-lit="true"]').length > 0);
  },
);

Then('o texto acessível do card diz {string}', function (this: PainelWorld, text: string) {
  const card = cardOf(String(this.memo['card']));
  assert.equal(card.querySelector('.sr-only')?.textContent, text);
  assert.equal(card.querySelector('svg')?.getAttribute('aria-hidden'), 'true');
});

Then(
  'o card de {string} mostra {string} em display de 7 segmentos',
  async function (this: PainelWorld, name: string, text: string) {
    this.memo['card'] = name;
    await this.eventually(() => assert.deepEqual(chars(cardOf(name)), [...text.padStart(4, ' ')]));
  },
);

Then('mostra {string}', function (this: PainelWorld, text: string) {
  assert.ok((cardOf(String(this.memo['card'])).textContent ?? '').includes(text));
});

Then('os dígitos acesos são vermelhos, em cor fixa de LED', function (this: PainelWorld) {
  const panel = cardOf(String(this.memo['card'])).querySelector('svg')?.parentElement;
  assert.ok(panel?.className.includes('text-red-500'));
  assert.ok(panel?.className.includes('bg-neutral-900'));
  assert.ok(!(panel?.className ?? '').includes('dark:'));
});

Then('a cor não depende da cor do pirômetro nem da temperatura', function (this: PainelWorld) {
  const card = cardOf(String(this.memo['card']));
  const panel = card.querySelector('svg')?.parentElement as HTMLElement;
  assert.equal(panel.style.color, '');
  assert.equal(panel.style.backgroundColor, '');
  assert.ok(!panel.className.includes('amber'));
});
