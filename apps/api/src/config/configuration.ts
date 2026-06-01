import type { EnvConfig } from "./env.schema";
import { envSchema } from "./env.schema";

export const configuration = (): EnvConfig => {
  const env = process.env as Record<string, string | undefined>;
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const messages = Object.entries(errors)
      .map(
        ([field, errs]) =>
          `  - ${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`,
      )
      .join("\n");

    throw new Error(
      `[Configuration] Variables d'environnement invalides ou manquantes:\n${messages}\n\n` +
        `Copier apps/api/.env.example en apps/api/.env et remplir les valeurs.`,
    );
  }

  return parsed.data;
};
