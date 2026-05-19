import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Layout du groupe (app) — routes protégées post-authentification
 * Clerk middleware gère la protection via src/middleware.ts
 * Ce layout ajoute une vérification serveur en double sécurité
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation — à implémenter lors du sprint UI */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
