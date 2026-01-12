import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour application dynamique avec routes dynamiques
  // output: 'export', // Désactivé pour permettre les routes dynamiques
  trailingSlash: true,
  images: {
    unoptimized: true, // Nécessaire pour l'export statique
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      }
    ],
  },
  // Headers pour servir correctement les fichiers .mjs
  async headers() {
    return [
      {
        source: '/pdf.worker.min.mjs',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },
  // Pas de serverActions en mode export
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: '10mb',
  //     allowedOrigins: ['v25.harx.ai', 'localhost'],
  //   },
  // },
};

export default nextConfig;
