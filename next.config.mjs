/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.7labs.org" }],
        destination: "https://7labs.org/:path*",
        permanent: true
      }
    ];
  },
  experimental: {
    optimizePackageImports: []
  }
};

export default nextConfig;
