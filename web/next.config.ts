import path from 'node:path';
import type { NextConfig } from 'next';

const API = process.env.API_ORIGIN ?? 'http://localhost:4000';

const config: NextConfig = {
    output: 'standalone',
    outputFileTracingRoot: import.meta.dirname,
    reactStrictMode: true,
    poweredByHeader: false,
    // The API already resizes uploads to WebP with thumbnails.
    images: { unoptimized: true },
    sassOptions: {
        loadPaths: [path.join(import.meta.dirname, 'src/styles')],
        additionalData: `@use 'sass:math'; @use 'variables' as *; @use 'mixins' as *;`,
    },
    // Dev only: in production nginx routes these before Next sees them.
    async rewrites() {
        return [
            { source: '/api/:path*', destination: `${API}/api/:path*` },
            { source: '/images/:path*', destination: `${API}/images/:path*` },
        ];
    },
};

export default config;
