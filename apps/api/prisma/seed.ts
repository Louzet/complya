/**
 * Seed de développement — Complya
 *
 * Usage : pnpm --filter api exec ts-node prisma/seed.ts
 *
 * À compléter lors de l'Alpha A02 (module utilisateurs/organisations)
 * Pour l'instant : structure prête, aucune donnée insérée
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed Complya — démarrage...');

  // TODO A02 : Créer une organisation de démo
  // TODO A02 : Créer un utilisateur admin de démo
  // TODO A02 : Créer une entreprise de démo (Gabon)

  console.log('✅ Seed terminé');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
