/** @type {import('next').NextConfig} */
const userConfig = {
    transpilePackages: ['react-leaflet', 'leaflet'],
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
      serverComponentsExternalPackages: ['leaflet'],
    },
  }
  
  export default userConfig