import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Webpack configuration for browser compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from browser bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        worker_threads: false,
        perf_hooks: false,
      };
    }
    return config;
  },
  
  // Add headers for SharedArrayBuffer support (required for Stockfish WASM)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
