import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PyrometerEditPanel } from '../../../../../adapters/presenters/components/PyrometerEditPanel';
import type { PyrometerDto } from '../../../../../core/domain/dtos/pyrometer.dto';
import { ProfileRejectedError } from '../../../../../core/domain/errors/profile-rejected.error';
import { ReadingsUnavailableError } from '../../../../../core/domain/errors/readings-unavailable.error';
import type { ISavePyrometerProfileUseCase } from '../../../../../interfaces/core/application/i-save-pyrometer-profile.use-case';
import { renderWithApp } from '../test-render';

type SaveExecute = ISavePyrometerProfileUseCase['execute'];

const PYROMETER: PyrometerDto = {
  id: 'SN-1',
  name: 'PI-12',
  nickname: null,
  color: '#2563eb',
  note: null,
  active: true,
};

function renderPanel(
  execute: ReturnType<typeof vi.fn<SaveExecute>>,
  options: {
    pyrometer?: PyrometerDto;
    colorsInUse?: ReadonlyMap<string, string>;
    blocked?: boolean;
    onDirtyChange?: (dirty: boolean) => void;
  } = {},
) {
  return renderWithApp(
    <PyrometerEditPanel
      pyrometer={options.pyrometer ?? PYROMETER}
      colorsInUse={options.colorsInUse ?? new Map()}
      blocked={options.blocked ?? false}
      onDirtyChange={options.onDirtyChange ?? vi.fn()}
    />,
    { savePyrometerProfileUseCase: { execute } },
  );
}

const typeNickname = (value: string): void => {
  fireEvent.change(screen.getByLabelText('Apelido'), { target: { value } });
};

describe('PyrometerEditPanel', () => {
  afterEach(() => cleanup());

  it('deve mostrar a bolinha, o nome mostrado e o serial no cabecalho quando renderizado', () => {
    // Arrange
    const execute = vi.fn<SaveExecute>();

    // Act
    renderPanel(execute, { pyrometer: { ...PYROMETER, nickname: 'Forno 2', color: '#e11d48' } });

    // Assert
    const form = screen.getByRole('form', { name: 'PI-12 - Forno 2' });
    expect(screen.getByRole('heading', { name: 'PI-12 - Forno 2' })).toBeInTheDocument();
    expect(form).toHaveTextContent('SN-1');
    expect(form.querySelector('[aria-hidden="true"]')).toHaveStyle({ backgroundColor: '#e11d48' });
  });

  it('deve preencher os campos com o complemento atual quando ele existe', () => {
    // Arrange
    const execute = vi.fn<SaveExecute>();
    const pyrometer = { ...PYROMETER, nickname: 'Forno 2', note: 'nota', active: false };

    // Act
    renderPanel(execute, { pyrometer });

    // Assert
    expect(screen.getByLabelText('Apelido')).toHaveValue('Forno 2');
    expect(screen.getByLabelText('Observação')).toHaveValue('nota');
    expect(screen.getByRole('switch', { name: 'Ativo' })).not.toBeChecked();
  });

  it('deve limitar apelido a 40 e observacao a 500 caracteres e contar os digitados quando renderizado', () => {
    // Arrange
    const execute = vi.fn<SaveExecute>();

    // Act
    renderPanel(execute, { pyrometer: { ...PYROMETER, nickname: 'Forno 2', note: 'nota' } });

    // Assert
    expect(screen.getByLabelText('Apelido')).toHaveAttribute('maxlength', '40');
    expect(screen.getByLabelText('Observação')).toHaveAttribute('maxlength', '500');
    expect(screen.getByText('7/40')).toBeInTheDocument();
    expect(screen.getByText('4/500')).toBeInTheDocument();
  });

  it('deve oferecer a observacao com 3 linhas quando renderizado', () => {
    // Arrange / Act
    renderPanel(vi.fn<SaveExecute>());

    // Assert
    expect(screen.getByLabelText('Observação')).toHaveAttribute('rows', '3');
  });

  it('deve atualizar o contador quando o apelido e digitado', () => {
    // Arrange
    renderPanel(vi.fn<SaveExecute>());

    // Act
    typeNickname('Forno 2');

    // Assert
    expect(screen.getByText('7/40')).toBeInTheDocument();
  });

  it('deve desabilitar Salvar e esconder Descartar quando nao ha alteracao', () => {
    // Arrange / Act
    renderPanel(vi.fn<SaveExecute>());

    // Assert
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Descartar alterações' })).toBeNull();
  });

  it('deve habilitar Salvar e mostrar Descartar quando ha alteracao', () => {
    // Arrange
    renderPanel(vi.fn<SaveExecute>());

    // Act
    typeNickname('Forno 2');

    // Assert
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Descartar alterações' })).toBeInTheDocument();
  });

  it('deve desabilitar Salvar quando o apelido passa de 40 caracteres', () => {
    // Arrange
    renderPanel(vi.fn<SaveExecute>());

    // Act
    typeNickname('x'.repeat(41));

    // Assert
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('deve desabilitar Salvar quando a observacao passa de 500 caracteres', () => {
    // Arrange
    renderPanel(vi.fn<SaveExecute>());

    // Act
    fireEvent.change(screen.getByLabelText('Observação'), { target: { value: 'y'.repeat(501) } });

    // Assert
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('deve voltar ao valor salvo e esconder Descartar quando as alteracoes sao descartadas', () => {
    // Arrange
    renderPanel(vi.fn<SaveExecute>(), { pyrometer: { ...PYROMETER, nickname: 'Forno 2' } });
    typeNickname('Outro');
    fireEvent.click(screen.getByRole('radio', { name: 'Vermelho' }));

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Descartar alterações' }));

    // Assert
    expect(screen.getByLabelText('Apelido')).toHaveValue('Forno 2');
    expect(screen.getByRole('radio', { name: 'Azul', checked: true })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descartar alterações' })).toBeNull();
  });

  it('deve avisar a pagina quando passa a haver alteracao e quando ela some', () => {
    // Arrange
    const onDirtyChange = vi.fn<(dirty: boolean) => void>();
    renderPanel(vi.fn<SaveExecute>(), { onDirtyChange });

    // Act
    typeNickname('Forno 2');
    fireEvent.click(screen.getByRole('button', { name: 'Descartar alterações' }));

    // Assert
    expect(onDirtyChange.mock.calls.map(([dirty]) => dirty)).toEqual([false, true, false]);
  });

  it('deve enviar o complemento digitado quando salva', async () => {
    // Arrange
    const execute = vi.fn<SaveExecute>().mockResolvedValue(PYROMETER);
    renderPanel(execute);
    typeNickname('Forno 2');
    fireEvent.change(screen.getByLabelText('Observação'), {
      target: { value: 'termopar trocado' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Vermelho' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Ativo' }));

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
    expect(execute).toHaveBeenCalledWith('SN-1', {
      nickname: 'Forno 2',
      color: '#dc2626',
      note: 'termopar trocado',
      active: false,
    });
  });

  it('deve enviar nulo quando apelido e observacao estao em branco', async () => {
    // Arrange
    const execute = vi.fn<SaveExecute>().mockResolvedValue(PYROMETER);
    renderPanel(execute, { pyrometer: { ...PYROMETER, nickname: 'Forno 2' } });
    typeNickname('   ');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(1));
    expect(execute).toHaveBeenCalledWith('SN-1', {
      nickname: null,
      color: '#2563eb',
      note: null,
      active: true,
    });
  });

  it('deve confirmar junto dos botoes e voltar a desabilitar Salvar quando a API aceita', async () => {
    // Arrange
    const execute = vi.fn<SaveExecute>().mockResolvedValue(PYROMETER);
    renderPanel(execute);
    typeNickname('Forno 2');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('Salvo.');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Descartar alterações' })).toBeNull();
  });

  it('deve avisar a pagina que nao ha mais alteracao quando salva com sucesso', async () => {
    // Arrange
    const onDirtyChange = vi.fn<(dirty: boolean) => void>();
    const execute = vi.fn<SaveExecute>().mockResolvedValue(PYROMETER);
    renderPanel(execute, { onDirtyChange });
    typeNickname('Forno 2');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(false));
  });

  it('deve mostrar a mensagem no painel e manter o digitado quando a API recusa com 422', async () => {
    // Arrange
    const execute = vi.fn<SaveExecute>().mockRejectedValue(new ProfileRejectedError(422));
    renderPanel(execute);
    typeNickname('Forno 2');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar: confira os campos.',
    );
    expect(screen.getByLabelText('Apelido')).toHaveValue('Forno 2');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });

  it('deve mostrar a mensagem de cor em uso e manter o digitado quando a API responde 409', async () => {
    // Arrange
    const execute = vi.fn<SaveExecute>().mockRejectedValue(new ProfileRejectedError(409));
    renderPanel(execute);
    typeNickname('Forno 2');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Essa cor já está em uso por outro pirômetro. Escolha outra cor.',
    );
    expect(screen.getByLabelText('Apelido')).toHaveValue('Forno 2');
  });

  it('deve pedir para tentar de novo quando a API nao responde', async () => {
    // Arrange
    const execute = vi.fn<SaveExecute>().mockRejectedValue(new ReadingsUnavailableError('falha'));
    renderPanel(execute);
    typeNickname('Forno 2');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar agora. Tente de novo.',
    );
  });

  it('deve limpar a confirmacao quando o usuario volta a editar', async () => {
    // Arrange
    const execute = vi.fn<SaveExecute>().mockResolvedValue(PYROMETER);
    renderPanel(execute);
    typeNickname('Forno 2');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByRole('status');

    // Act
    typeNickname('Novo');

    // Assert
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  });

  it('deve desabilitar o botao e mostrar salvando enquanto a API nao responde', async () => {
    // Arrange
    const execute = vi
      .fn<SaveExecute>()
      .mockReturnValue(new Promise<PyrometerDto>(() => undefined));
    renderPanel(execute);
    typeNickname('Forno 2');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    expect(await screen.findByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });

  it('deve desabilitar a cor de outro pirometro quando recebe o mapa de cores em uso', () => {
    // Arrange / Act
    renderPanel(vi.fn<SaveExecute>(), { colorsInUse: new Map([['#dc2626', 'PI-13']]) });

    // Assert
    expect(screen.getByRole('radio', { name: 'Vermelho (em uso por PI-13)' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Azul', checked: true })).toBeEnabled();
  });

  it('deve mostrar o aviso de alteracoes nao salvas quando a troca esta bloqueada e ha alteracao', () => {
    // Arrange
    renderPanel(vi.fn<SaveExecute>(), { blocked: true });

    // Act
    typeNickname('Forno 2');

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Há alterações não salvas');
  });

  it('deve nao mostrar o aviso quando a troca nao esta bloqueada', () => {
    // Arrange
    renderPanel(vi.fn<SaveExecute>(), { blocked: false });

    // Act
    typeNickname('Forno 2');

    // Assert
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('deve nao oferecer acao de criar ou excluir pirometro quando renderizado', () => {
    // Arrange / Act
    renderPanel(vi.fn<SaveExecute>());

    // Assert
    expect(screen.queryByRole('button', { name: /criar|novo|excluir|apagar/i })).toBeNull();
  });
});
