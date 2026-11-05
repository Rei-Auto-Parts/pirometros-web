/** O complemento que o usuario edita; `null` volta ao padrao (sem apelido, cor padrao). */
export interface PyrometerProfileDto {
  readonly nickname: string | null;
  readonly color: string | null;
  readonly note: string | null;
  readonly active: boolean;
}
