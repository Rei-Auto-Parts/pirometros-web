import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { PyrometersPage } from '../../../../../adapters/presenters/pages/PyrometersPage';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import type { IListPyrometersUseCase } from '../../../../../interfaces/core/application/i-list-pyrometers.use-case';
import type { ISavePyrometerProfileUseCase } from '../../../../../interfaces/core/application/i-save-pyrometer-profile.use-case';
import { renderWithApp } from '../test-render';

type ListExecute = IListPyrometersUseCase['execute'];
type SaveExecute = ISavePyrometerProfileUseCase['execute'];

function pyrometer(id: string, name: string, overrides: Partial<PyrometerDto> = {}): PyrometerDto {
  return { id, name, nickname: null, color: '#2563eb', note: null, active: true, ...overrides };
}

const TWO = [pyrometer('B', 'PI-15', { color: '#dc2626', active: false }), pyrometer('A', 'PI-12')];

function renderPage(execute: Mock<ListExecute>, save: Mock<SaveExecute> = vi.fn<SaveExecute>()) {
  return renderWithApp(<PyrometersPage />, {
    listPyrometersUseCase: { execute },
    savePyrometerProfileUseCase: { execute: save },
  });
}

const rows = (): HTMLElement[] => screen.getAllByRole('option');
const typeNickname = (value: string): void => {
  fireEvent.change(screen.getByLabelText('Apelido'), { target: { value } });
};

describe('PyrometersPage', () => {
  afterEach(() => cleanup());

  it('deve listar todos os pirometros, ativos e inativos, em ordem pelo nome mostrado', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);

    // Act
    renderPage(execute);

    // Assert
    await screen.findAllByRole('option');
    expect(rows().map((row) => row.textContent)).toEqual([
      expect.stringContaining('PI-12'),
      expect.stringContaining('PI-15'),
    ]);
    expect(rows()[1]).toHaveTextContent('Inativo');
  });

  it('deve selecionar o primeiro da lista e abrir o painel dele quando a lista chega', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);

    // Act
    renderPage(execute);

    // Assert
    expect(await screen.findByRole('form', { name: 'PI-12' })).toBeInTheDocument();
    expect(rows()[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('form')).toHaveLength(1);
  });

  it('deve trocar o painel quando outra linha e clicada e nao ha alteracao', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);
    renderPage(execute);
    await screen.findByRole('form', { name: 'PI-12' });

    // Act
    fireEvent.click(rows()[1] as HTMLElement);

    // Assert
    expect(await screen.findByRole('form', { name: 'PI-15' })).toBeInTheDocument();
    expect(rows()[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('switch', { name: 'Ativo' })).not.toBeChecked();
  });

  it('deve usar duas colunas a partir de 1024 px sem o limite estreito de largura quando renderizada', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);

    // Act
    const { container } = renderPage(execute);
    await screen.findByRole('form', { name: 'PI-12' });

    // Assert
    const grid = screen.getByRole('listbox').closest('[data-layout]');
    expect(grid?.className).toContain('lg:grid-cols-[minmax(0,1fr)_24rem]');
    expect(container.innerHTML).not.toContain('max-w-3xl');
  });

  it('deve manter o painel fixo na rolagem quando a tela e larga', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);

    // Act
    renderPage(execute);
    const form = await screen.findByRole('form', { name: 'PI-12' });

    // Assert
    expect(form.parentElement?.className).toContain('lg:sticky');
  });

  it('deve bloquear a troca e avisar quando ha alteracao nao salva', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);
    renderPage(execute);
    await screen.findByRole('form', { name: 'PI-12' });
    typeNickname('Forno 2');

    // Act
    fireEvent.click(rows()[1] as HTMLElement);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Há alterações não salvas');
    expect(screen.getByRole('form', { name: 'PI-12' })).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'PI-15' })).toBeNull();
    expect(rows()[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('deve trocar para a linha pedida quando as alteracoes sao descartadas', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);
    renderPage(execute);
    await screen.findByRole('form', { name: 'PI-12' });
    typeNickname('Forno 2');
    fireEvent.click(rows()[1] as HTMLElement);
    await screen.findByRole('alert');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Descartar alterações' }));

    // Assert
    expect(await screen.findByRole('form', { name: 'PI-15' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('deve trocar para a linha pedida quando as alteracoes sao salvas', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);
    const save = vi.fn<SaveExecute>().mockResolvedValue(TWO[1] as PyrometerDto);
    renderPage(execute, save);
    await screen.findByRole('form', { name: 'PI-12' });
    typeNickname('Forno 2');
    fireEvent.click(rows()[1] as HTMLElement);
    await screen.findByRole('alert');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(await screen.findByRole('form', { name: 'PI-15' })).toBeInTheDocument();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('A', expect.objectContaining({ nickname: 'Forno 2' }));
  });

  it('deve manter o painel quando o salvamento falha e a troca esta pedida', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);
    const save = vi.fn<SaveExecute>().mockRejectedValue(new ReadingsUnavailableError('falha'));
    renderPage(execute, save);
    await screen.findByRole('form', { name: 'PI-12' });
    typeNickname('Forno 2');
    fireEvent.click(rows()[1] as HTMLElement);
    await screen.findByRole('alert');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0));
    expect(screen.getByLabelText('Apelido')).toHaveValue('Forno 2');
    expect(rows()[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('deve desabilitar no painel a cor usada por outro pirometro quando ha cores em uso', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);

    // Act
    renderPage(execute);
    const form = within(await screen.findByRole('form', { name: 'PI-12' }));

    // Assert
    expect(form.getByRole('radio', { name: 'Vermelho (em uso por PI-15)' })).toBeDisabled();
    expect(form.getByRole('radio', { name: 'Azul', checked: true })).toBeEnabled();
  });

  it('deve nao oferecer criar nem excluir pirometro quando lista', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);

    // Act
    renderPage(execute);
    await screen.findByRole('form', { name: 'PI-12' });

    // Assert
    expect(
      screen.queryByRole('button', { name: /criar|novo|adicionar|excluir|apagar/i }),
    ).toBeNull();
  });

  it('deve mostrar o carregando quando a lista ainda nao chegou', () => {
    // Arrange
    const execute = vi
      .fn<ListExecute>()
      .mockReturnValue(new Promise<PyrometerDto[]>(() => undefined));

    // Act
    renderPage(execute);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('deve informar que nao ha pirometros quando a lista e vazia', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue([]);

    // Act
    renderPage(execute);

    // Assert
    expect(await screen.findByText('Nenhum pirômetro encontrado.')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('deve mostrar indisponivel com tentar de novo quando a API falha', async () => {
    // Arrange
    const execute = vi
      .fn<ListExecute>()
      .mockRejectedValueOnce(new ReadingsUnavailableError('falha'))
      .mockResolvedValue([pyrometer('A', 'PI-12')]);
    renderPage(execute);

    // Act
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    // Assert
    expect(await screen.findByRole('form', { name: 'PI-12' })).toBeInTheDocument();
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('deve manter o cabecalho compacto com titulo e uma linha de descricao quando renderizada', async () => {
    // Arrange
    const execute = vi.fn<ListExecute>().mockResolvedValue(TWO);

    // Act
    renderPage(execute);
    await screen.findByRole('form', { name: 'PI-12' });

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Pirômetros' })).toBeInTheDocument();
    expect(
      screen.getByText('Apelido, cor e observação dos pirômetros que já existem nos dados.'),
    ).toBeInTheDocument();
  });
});
