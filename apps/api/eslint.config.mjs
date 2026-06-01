// Flat config api (NestJS). Reprend la base partagée + ancre le projet TS local.
import base from '@complya/config/eslint-base';

export default [
  ...base,
  {
    languageOptions: {
      parserOptions: {
        // Ancre projectService sur le tsconfig de l'app pour le lint type-aware.
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  { ignores: ['dist/**', 'prisma/**'] },
];
