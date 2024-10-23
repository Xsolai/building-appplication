/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*', // Proxy to Backend
      },
    ]
  },
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Adjust this based on your needs
    },
  },
};

export default nextConfig;