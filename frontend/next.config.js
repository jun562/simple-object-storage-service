/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 개발 도구 비활성화
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
  experimental: {
    appDir: true,
  },
  // 서버 설정 추가
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://10.0.10.163:8080/:path*",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
