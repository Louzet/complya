// Flat config web (Next.js 15 / React 19).
// Next déprécie `next lint` → on lint via la CLI ESLint avec les presets Next
// pontés en flat config par FlatCompat.
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      '**/*.config.{js,cjs,mjs,ts}',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];
