export class HealthUnavailableError extends Error {
  constructor(detail: string) {
    super(`saude indisponivel: ${detail}`);
    this.name = 'HealthUnavailableError';
  }
}
