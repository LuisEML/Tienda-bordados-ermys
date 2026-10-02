import type { NextConfig } from "next";

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
        hostname: '**.supabase.co', // Se recomienda usar dos asteriscos (**) para subdominios en Next.js
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
    return [
      {
        // Aplica estas cabeceras a todas las rutas de la aplicación
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Protege contra Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Previene el sniffing de MIME
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
            value: 'max-age=31536000; includeSubDomains; preload', // Fuerza conexiones HTTPS seguras
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline';", // Requerido para la hidratación de Next.js
              "style-src 'self' 'unsafe-inline';", // Soporte para estilos CSS/Tailwind
              "img-src 'self' data: blob: https:;", // Permite tus imágenes externas
              "font-src 'self' data:;",
              "connect-src 'self' https:;", // Permite conexiones a Supabase, Resend y APIs externas
              "frame-ancestors 'none';",
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;