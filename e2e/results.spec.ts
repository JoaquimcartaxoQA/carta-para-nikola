import { expect, test } from './fixtures';

test('anuncia a vitória assim que Nikola termina em primeiro e permite correr de novo', async ({ page }) => {
  await page.goto('/e2e/harness.html?winner=nikola');
  await expect(page.getByRole('heading', { name: /vitória do nikola/i })).toBeVisible();
  await expect(page.getByText('00:03.0').first()).toBeVisible();
  await page.getByRole('button', { name: /jogar novamente/i }).click();
  await expect(page.getByRole('status')).toHaveText('Nova corrida');
});

test('exibe o pódio completo por tempo de chegada e permite voltar ao menu', async ({ page }) => {
  await page.goto('/e2e/harness.html?winner=rafael');
  await expect(page.getByRole('heading', { name: /grande corrida/i })).toBeVisible();
  await expect(page.getByText('00:03.2')).toBeVisible();
  await expect(page.getByText('00:04.8')).toBeVisible();
  await page.getByRole('button', { name: /menu principal/i }).click();
  await expect(page.getByRole('status')).toHaveText('Menu aberto');
});

test('aplica turbo, derrapagem e recuperação conforme o estado da pista', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const physicsPath = '/src/game/physics.ts';
    const trackPath = '/src/game/trackData.ts';
    const { createInitialCarState, updatePhysics } = await import(physicsPath);
    const { getTrackData } = await import(trackPath);
    const base = getTrackData('city');
    const controls = { up: false, down: false, left: false, right: false, honk: false };
    const run = (type: string) => {
      const cars = createInitialCarState(base, 2);
      const { x, y } = cars.nikola;
      updatePhysics(cars, controls, { ...base, obstacles: [{ x, y, radius: 20, type }] }, 2, 0, 1 / 60, true);
      return { boost: cars.nikola.boostTimer, spin: cars.nikola.spinTimer, cooldown: cars.nikola.obstacleHitCooldown };
    };
    const cars = createInitialCarState(base, 2);
    cars.nikola.stuckTimer = 1.5;
    updatePhysics(cars, controls, { ...base, obstacles: [] }, 2, 100, 1 / 60, true);
    return { boost: run('boost'), puddle: run('puddle'), cone: run('cone'),
      recovered: { speed: cars.nikola.speed, stuck: cars.nikola.stuckTimer } };
  });
  expect(result.boost).toEqual({ boost: 2, spin: 0, cooldown: 1.2 });
  expect(result.puddle).toEqual({ boost: 0, spin: 0.35, cooldown: 1.2 });
  expect(result.cone).toEqual({ boost: 0, spin: 0, cooldown: 1 });
  expect(result.recovered.speed).toBeGreaterThan(0);
  expect(result.recovered.stuck).toBe(0);
});
