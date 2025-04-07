/** @type {import('next').NextConfig} */
const userConfig = {
    // Remove transpilePackages to avoid conflict
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
    experimental: {
      // Keep only this configuration for leaflet
      serverComponentsExternalPackages: ['leaflet', 'react-leaflet'],
    },
  }
  
  export default userConfig
  
  