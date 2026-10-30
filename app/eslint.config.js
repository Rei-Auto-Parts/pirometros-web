import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules', 'htmlcov', 'adapters/clients/api-schema.d.ts'],
  },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
);
