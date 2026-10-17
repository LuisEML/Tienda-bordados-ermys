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
    // Dominios permitidos para Meta/Facebook
    const fbScriptDomains = "https://connect.facebook.net https://www.facebook.com https://*.facebook.com";
    
    const scriptSrcPolicy = isDev
      ? `'self' 'unsafe-eval' 'unsafe-inline' ${fbScriptDomains}`
      : `'self' 'unsafe-inline' ${fbScriptDomains}`;

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
              `script-src ${scriptSrcPolicy};`,
              `script-src-elem ${scriptSrcPolicy};`,
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https://www.facebook.com https://*.facebook.com https://*.fbcdn.net https:;",
              "media-src 'self' data: blob: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://www.facebook.com https://*.facebook.com https://connect.facebook.net https:;",
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