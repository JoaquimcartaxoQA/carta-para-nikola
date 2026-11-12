import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  retries: 0,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:15174', trace: 'retain-on-failure' },
  webServer: { command: 'npm exec -- vite --host 127.0.0.1 --port 15174 --strictPort', url: 'http://127.0.0.1:15174' },
});
