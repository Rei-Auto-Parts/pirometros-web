import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY } from '../../../../core/domain/constants/theme.constants';

const html = readFileSync(path.resolve(import.meta.dirname, '../../../../index.html'), 'utf8');

describe('index.html', () => {
  it('deve ler a mesma chave de tema do app quando aplica o tema antes de pintar', () => {
    // Assert
    expect(html).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`);
  });

  it('deve por a classe dark no html quando o tema salvo e o escuro', () => {
    // Assert
    expect(html).toMatch(/=== 'dark'/);
    expect(html).toContain("classList.add('dark')");
  });

  it('deve proteger o script com try/catch quando o armazenamento esta bloqueado', () => {
    // Arrange
    const script = html.slice(html.indexOf('<script>'), html.indexOf('</script>'));

    // Assert
    expect(script).toContain('try');
    expect(script).toContain('catch');
  });

  it('deve rodar o script do tema antes do modulo do app para nao piscar o claro', () => {
    // Assert
    expect(html.indexOf('localStorage.getItem')).toBeGreaterThan(-1);
    expect(html.indexOf('localStorage.getItem')).toBeLessThan(html.indexOf('/main.tsx'));
  });
});
