/** A API recusou o complemento: serial inexistente (404), cor ja em uso por outro pirometro (409) ou campo invalido (422). */
export class ProfileRejectedError extends Error {
  constructor(readonly status: number) {
    super(`complemento recusado: status HTTP ${status}`);
    this.name = 'ProfileRejectedError';
  }
}
