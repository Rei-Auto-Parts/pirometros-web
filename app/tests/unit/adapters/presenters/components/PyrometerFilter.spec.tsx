import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PyrometerFilter } from '../../../../../adapters/presenters/components/PyrometerFilter';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';

function build(overrides: Partial<PyrometerDto> & Pick<PyrometerDto, 'id' | 'name'>): PyrometerDto {
  return { nickname: null, color: '#2563eb', note: null, active: true, ...overrides };
}

const PYROMETERS: readonly PyrometerDto[] = [
  build({ id: 'SN-001', name: 'Forno 1' }),
  build({ id: 'SN-002', name: null }),
];

function renderFilter(value: string | null): ReturnType<typeof vi.fn<(id: string | null) => void>> {
  const onChange = vi.fn<(id: string | null) => void>();
  render(<PyrometerFilter pyrometers={PYROMETERS} value={value} onChange={onChange} />);
  return onChange;
}

describe('PyrometerFilter', () => {
  afterEach(() => cleanup());

  it('deve listar a opção Todos e um item por pirômetro quando renderizado', () => {
    // Arrange
    // Act
    renderFilter(null);

    // Assert
    const labels = screen.getAllByRole('option').map((option) => option.textContent);
    expect(labels).toEqual(['Todos', 'Forno 1', 'SN-002']);
  });

  it('deve mostrar o serial quando o pirômetro não tem nome', () => {
    // Arrange
    // Act
    renderFilter(null);

    // Assert
    expect(screen.getByRole('option', { name: 'SN-002' })).toBeTruthy();
  });

  it('deve selecionar o pirômetro recebido quando value estiver preenchido', () => {
    // Arrange
    // Act
    renderFilter('SN-001');

    // Assert
    expect(screen.getByLabelText('Pirômetro')).toHaveProperty('value', 'SN-001');
  });

  it('deve chamar onChange com o id quando um pirômetro for escolhido', () => {
    // Arrange
    const onChange = renderFilter(null);

    // Act
    fireEvent.change(screen.getByLabelText('Pirômetro'), { target: { value: 'SN-001' } });

    // Assert
    expect(onChange).toHaveBeenCalledWith('SN-001');
  });

  it('deve chamar onChange com null quando Todos for escolhido', () => {
    // Arrange
    const onChange = renderFilter('SN-001');

    // Act
    fireEvent.change(screen.getByLabelText('Pirômetro'), { target: { value: '' } });

    // Assert
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('deve mostrar só a opção Todos quando não houver pirômetros', () => {
    // Arrange
    const onChange = vi.fn<(id: string | null) => void>();

    // Act
    render(<PyrometerFilter pyrometers={[]} value={null} onChange={onChange} />);

    // Assert
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('deve mostrar o apelido quando o pirômetro tem apelido', () => {
    // Arrange
    const onChange = vi.fn<(id: string | null) => void>();
    const pyrometers = [build({ id: 'SN-003', name: 'PI-12', nickname: 'Forno 2' })];

    // Act
    render(<PyrometerFilter pyrometers={pyrometers} value={null} onChange={onChange} />);

    // Assert
    expect(screen.getByRole('option', { name: 'PI-12 - Forno 2' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'PI-12' })).toBeNull();
  });

  it('deve marcar como inativo quando o pirômetro está inativo', () => {
    // Arrange
    const onChange = vi.fn<(id: string | null) => void>();
    const pyrometers = [build({ id: 'SN-004', name: 'PI-15', active: false })];

    // Act
    render(<PyrometerFilter pyrometers={pyrometers} value={null} onChange={onChange} />);

    // Assert
    expect(screen.getByRole('option', { name: 'PI-15 (inativo)' })).toBeTruthy();
  });
});
