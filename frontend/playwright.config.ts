import { defineConfig, devices } from '@playwright/test';

const MOCK_API_PORT = 4100;
const WEB_PORT = 5174;
const HOST = 'localhost';
export const BASE_URL = `http://${HOST}:${WEB_PORT}`;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile', use: { ...devices['iPhone 13'] } },
    ],

    // The suite tests the frontend, so it runs against a deterministic stub rather
    // than Atlas. Vite proxies /api to it exactly as it proxies the real API.
    webServer: [
        {
            command: `node e2e/mock-api.mjs`,
            port: MOCK_API_PORT,
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore',
        },
        {
            command: `npm run dev -- --port ${WEB_PORT} --strictPort`,
            url: BASE_URL,
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore',
            env: { VITE_DEV_API_TARGET: `http://127.0.0.1:${MOCK_API_PORT}` },
        },
    ],
});
