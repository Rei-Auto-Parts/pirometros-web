export class ReadingsUnavailableError extends Error {
  constructor(detail: string) {
    super(`leituras indisponiveis: ${detail}`);
    this.name = 'ReadingsUnavailableError';
  }
}
