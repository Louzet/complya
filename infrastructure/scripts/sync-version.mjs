#!/usr/bin/env node
/**
 * Synchronise la version vers tous les package.json du monorepo.
 * Appelé automatiquement par release-it via le hook after:bump.
 *
 * Usage : node infrastructure/scripts/sync-version.mjs <version>
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const version = process.argv[2];

if (!version) {
  console.error('Usage: node sync-version.mjs <version>');
  process.exit(1);
}

const targets = [
  'apps/api/package.json',
  'apps/web/package.json',
];

for (const rel of targets) {
  const file = join(root, rel);
  const pkg = JSON.parse(readFileSync(file, 'utf-8'));
  pkg.version = version;
  writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`synced ${rel} → ${version}`);
}
