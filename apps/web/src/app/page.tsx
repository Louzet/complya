import { redirect } from 'next/navigation';

/**
 * Page racine — redirige vers le dashboard
 * L'auth est gérée par le middleware Clerk
 */
export default function Home() {
  redirect('/dashboard');
}
