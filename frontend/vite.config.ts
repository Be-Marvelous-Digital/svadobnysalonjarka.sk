import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { sitemapPlugin } from './sitemap.plugin.ts';

// Less resolves @import against the importing file, not Vite's aliases, so the shared
// tokens are prepended by absolute path instead.
const stylesDir = path.resolve(import.meta.dirname, './src/styles').replace(/\\/g, '/');

export default defineConfig({
    plugins: [react(), sitemapPlugin()],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: false,
                math: 'always',
                additionalData: `@import '${stylesDir}/variables.less';\n@import '${stylesDir}/mixins.less';\n`,
            },
        },
        modules: {
            generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
    },
    server: {
        port: Number(process.env.PORT) || 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_DEV_API_TARGET ?? 'http://localhost:4000',
                changeOrigin: true,
            },
            '/images': {
                target: process.env.VITE_DEV_API_TARGET ?? 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
