/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode standalone pour le build Docker de production
  output: 'standalone',

  // Transpiler les packages du monorepo
  transpilePackages: ['@complya/types', '@complya/schemas', '@complya/sdk'],

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Pas de logique métier dans Next.js — uniquement BFF léger
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
