// @ts-check
// ============================================================
// Config ESLint partagée — flat config (ESLint 9 + typescript-eslint 8)
//
// Consommée par apps/api (et toute app NestJS/TS pur) via :
//   import base from '@complya/config/eslint-base'
//
// Les apps spreadent ce tableau puis ajoutent leur tsconfigRootDir.
// Les règles type-aware s'appuient sur projectService (auto-découverte du tsconfig).
// ============================================================
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignorés globaux — équivalent flat des anciens ignorePatterns.
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/*.config.{js,cjs,mjs,ts}',
    ],
  },

  // Base JS + TS type-checked (remplace recommended-requiring-type-checking).
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        // Auto-découvre le tsconfig le plus proche de chaque fichier.
        projectService: true,
      },
    },
    rules: {
      // TypeScript strict — aucun `any`, aucune opération non typée.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Qualité.
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],

      // Général.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Tests & specs : on garde le lint de base mais on coupe les règles type-aware
  // (les mocks et casts `as never` déclenchent légitimement no-unsafe-*).
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.test.ts'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      'no-console': 'off',
    },
  },
);
