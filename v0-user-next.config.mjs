/** @type {import('next').NextConfig} */
const userConfig = {
    // Fix: Use serverExternalPackages instead of serverComponentsExternalPackages
    experimental: {
      // This is the correct option name for Next.js 15
      serverExternalPackages: ['leaflet', 'react-leaflet'],
    },
    images: {
      domains: [
        'cdnjs.cloudflare.com',
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
  }
  
  export default userConfig
  
  