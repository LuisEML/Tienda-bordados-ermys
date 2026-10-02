import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  }, 
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bordadosermi.com.mx',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    // En desarrollo local (dev) permitimos 'unsafe-eval' para React/Turbopack.
    // En producción (Vercel/servidor) se elimina automáticamente para máxima seguridad.
    const scriptSrcPolicy = isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline';"
      : "script-src 'self' 'unsafe-inline';";

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              scriptSrcPolicy,
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https:;",
              "media-src 'self' data: blob: https:;", // Permite cargar videos locales y externos por HTTPS
              "font-src 'self' data:;",
              "connect-src 'self' https:;",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
              "frame-ancestors 'none';",
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;