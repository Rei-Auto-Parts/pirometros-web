import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReadingsTable } from '../../../../../adapters/presenters/components/ReadingsTable';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import type { ReadingDto } from '../../../../../core/domain/dtos/reading.dto';

const buildReading = (overrides: Partial<ReadingDto>): ReadingDto => ({
  id: 1,
  measuredAt: '2026-10-29T11:00:30',
  pyrometerId: 'PIR-001',
  pyrometerName: 'Forno 1',
  temperature: 850,
  unit: 'C',
  battery: 90,
  place: 3,
  ...overrides,
});

const bodyRows = (): HTMLElement[] => screen.getAllByRole('row').slice(1);

describe('ReadingsTable', () => {
  it('deve exibir os cabecalhos em pt-BR quando renderizada', () => {
    // Arrange
    const items: readonly ReadingDto[] = [];

    // Act
    render(<ReadingsTable items={items} />);

    // Assert
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(['Data', 'Pirômetro', 'Temperatura', 'Unidade', 'Bateria', 'Local']);
  });

  it('deve exibir a linha completa quando a leitura tem todos os campos', () => {
    // Arrange
    const items = [buildReading({})];

    // Act
    render(<ReadingsTable items={items} />);

    // Assert
    const cells = within(bodyRows()[0] as HTMLElement).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual([
      '29/10/2026 11:00',
      'Forno 1',
      '850',
      'C',
      '90',
      '3',
    ]);
  });

  it('deve exibir o serial quando o pirometro nao tem nome', () => {
    // Arrange
    const items = [buildReading({ pyrometerName: null })];

    // Act
    render(<ReadingsTable items={items} />);

    // Assert
    const cells = within(bodyRows()[0] as HTMLElement).getAllByRole('cell');
    expect(cells[1]?.textContent).toBe('PIR-001');
  });

  it('deve exibir traco quando bateria e local sao nulos', () => {
    // Arrange
    const items = [buildReading({ battery: null, place: null })];

    // Act
    render(<ReadingsTable items={items} />);

    // Assert
    const cells = within(bodyRows()[0] as HTMLElement).getAllByRole('cell');
    expect(cells[4]?.textContent).toBe('—');
    expect(cells[5]?.textContent).toBe('—');
  });

  it('deve manter a ordem recebida quando ha varias leituras', () => {
    // Arrange
    const items = [
      buildReading({ id: 2, pyrometerName: 'B' }),
      buildReading({ id: 1, pyrometerName: 'A' }),
    ];

    // Act
    render(<ReadingsTable items={items} />);

    // Assert
    const names = bodyRows().map((row) => within(row).getAllByRole('cell')[1]?.textContent);
    expect(names).toEqual(['B', 'A']);
  });

  it('deve exibir so o cabecalho quando a lista esta vazia', () => {
    // Arrange
    const items: readonly ReadingDto[] = [];

    // Act
    render(<ReadingsTable items={items} />);

    // Assert
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });

  it('deve exibir o apelido na coluna do pirometro quando ele esta na lista de pirometros', () => {
    // Arrange
    const pyrometers: PyrometerDto[] = [
      {
        id: 'PIR-001',
        name: 'Forno 1',
        nickname: 'Forno 2',
        color: '#2563eb',
        note: null,
        active: true,
      },
    ];

    // Act
    render(<ReadingsTable items={[buildReading({})]} pyrometers={pyrometers} />);

    // Assert
    const name = within(bodyRows()[0] as HTMLElement).getAllByRole('cell')[1]?.textContent;
    expect(name).toBe('Forno 1 - Forno 2');
  });

  it('deve exibir o nome da leitura quando o pirometro nao esta na lista', () => {
    // Arrange / Act
    render(<ReadingsTable items={[buildReading({})]} pyrometers={[]} />);

    // Assert
    const name = within(bodyRows()[0] as HTMLElement).getAllByRole('cell')[1]?.textContent;
    expect(name).toBe('Forno 1');
  });
});
