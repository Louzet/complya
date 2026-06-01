import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    environment: "node",
    // Tests unitaires uniquement — l'e2e (test/) tourne via vitest.e2e.config.ts.
    include: ["src/**/*.spec.ts"],
  },
  plugins: [
    // SWC transpile les TS avec emitDecoratorMetadata, indispensable pour
    // que l'injection de dépendances NestJS fonctionne dans les tests.
    swc.vite({
      module: { type: "es6" },
      jsc: {
        parser: { syntax: "typescript", decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
