import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * Schema Zod de validation d'une règle fiscale
 */
const taxRuleContributionSchema = z.object({
  rate: z.number().min(0).max(1),
  base: z.string(),
  ceiling: z.number().nullable(),
  label: z.string(),
});

export const taxRuleSchema = z.object({
  id: z.string(),
  country: z.string().length(2),
  authority: z.string(),
  name: z.string(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.string().length(3),
  declarationFrequency: z.enum(['monthly', 'quarterly', 'annual']),
  declarationDeadline: z.string(),
  notes: z.string().optional(),
  contributions: z
    .record(
      z.record(taxRuleContributionSchema),
    )
    .optional(),
});

export type TaxRule = z.infer<typeof taxRuleSchema>;

/**
 * Charge et valide un fichier de règle fiscale YAML
 */
export function loadTaxRule(filePath: string): TaxRule {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Fichier de règle fiscale introuvable : ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const parsed = yaml.load(content);

  const result = taxRuleSchema.safeParse(parsed);

  if (!result.success) {
    const errors = result.error.flatten();
    throw new Error(
      `Règle fiscale invalide dans ${filePath}: ${JSON.stringify(errors.fieldErrors)}`,
    );
  }

  return result.data;
}

/**
 * Charge toutes les règles pour un pays et une autorité donnés
 */
export function loadRulesForAuthority(
  country: string,
  authority: string,
): TaxRule[] {
  const rulesDir = path.resolve(
    __dirname,
    '../rules',
    country.toUpperCase(),
    authority.toUpperCase(),
  );

  if (!fs.existsSync(rulesDir)) {
    return [];
  }

  const files = fs
    .readdirSync(rulesDir)
    .filter((f: string) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort(); // tri alphabétique = tri chronologique via le format YYYY-MM-DD

  return files.map((f: string) => loadTaxRule(path.join(rulesDir, f)));
}

/**
 * Retourne la règle en vigueur à une date donnée
 */
export function getActiveRule(
  country: string,
  authority: string,
  atDate: Date = new Date(),
): TaxRule | null {
  const rules = loadRulesForAuthority(country, authority);

  const dateStr = atDate.toISOString().split('T')[0];

  // La dernière règle dont effectiveDate <= atDate
  const active = rules
    .filter((r) => r.effectiveDate <= (dateStr ?? ''))
    .at(-1);

  return active ?? null;
}
