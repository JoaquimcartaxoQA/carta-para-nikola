import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const output = mkdtempSync(join(tmpdir(), 'nikola-coverage-'));
try {
  const test = spawnSync(process.execPath,
    ['node_modules/@playwright/test/cli.js', 'test', '--workers=1', ...process.argv.slice(2)],
    { stdio: 'inherit', env: { ...process.env, VITE_COVERAGE: 'true', NIKOLA_COVERAGE_DIR: output } });
  if (test.error) throw test.error;
  const report = spawnSync(process.execPath, ['node_modules/nyc/bin/nyc.js', 'report', '--temp-dir', output,
    '--reporter=text', '--reporter=text-summary', '--reporter=html', '--report-dir', 'coverage/browser',
    '--check-coverage', '--lines', '80', '--branches', '80'], { stdio: 'inherit' });
  if (report.error) throw report.error;
  process.exitCode = test.status || report.status || 0;
} finally {
  rmSync(output, { recursive: true, force: true });
}
