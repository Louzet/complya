import { envSchema, EnvConfig } from './env.schema';

export const configuration = (): EnvConfig => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = process.env as Record<string, string | undefined>;
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const messages = Object.entries(errors)
      .map(([field, errs]) => `  - ${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
      .join('\n');

    throw new Error(
      `[Configuration] Variables d'environnement invalides ou manquantes:\n${messages}\n\n` +
        `Copier apps/api/.env.example en apps/api/.env et remplir les valeurs.`,
    );
  }

  return parsed.data;
};
