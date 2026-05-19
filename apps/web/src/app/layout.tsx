import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Complya — Conformité fiscale CEMAC',
  description:
    'Plateforme de conformité fiscale & déclarative pour PME en zone OHADA/CEMAC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="fr" className="h-full">
        <body className="h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
