import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test as base } from '@playwright/test';

export const test = base.extend<{ coverage: void }>({
  coverage: [async ({ page }, use, info) => {
    await use();
    if (process.env.VITE_COVERAGE !== 'true' || info.status !== 'passed') return;
    const counters = await page.evaluate(() => (globalThis as { __coverage__?: object }).__coverage__);
    if (!counters || Object.keys(counters).length === 0) throw new Error('Browser coverage was not collected');
    const output = process.env.NIKOLA_COVERAGE_DIR ?? '.nyc_output';
    await mkdir(output, { recursive: true });
    await writeFile(join(output, `${info.testId}-${info.retry}.json`), JSON.stringify(counters));
  }, { auto: true }],
});

export { expect } from '@playwright/test';
